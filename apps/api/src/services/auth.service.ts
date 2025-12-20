import { db } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateTokens } from '../utils/jwt';
import { JWTPayload } from '@merchant-app/shared';

/**
 * Merchant registration data
 */
export interface MerchantRegisterInput {
  merchant_name: string;
  owner_name: string;
  email: string;
  password: string;
}

/**
 * Merchant login data
 */
export interface MerchantLoginInput {
  email: string;
  password: string;
}

/**
 * Merchant registration result
 */
export interface MerchantRegisterResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    merchantId: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Merchant login result
 */
export interface MerchantLoginResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    merchantId: string;
  };
  accessToken: string;
  refreshToken: string;
}

/**
 * Register a new merchant and create merchant_owner user
 * 
 * This function:
 * 1. Creates a new merchant record
 * 2. Hashes the password
 * 3. Creates a merchant_owner user for that merchant
 * 4. Generates JWT tokens
 * 
 * @param input - Registration data
 * @returns User data and tokens
 */
export async function registerMerchant(
  input: MerchantRegisterInput
): Promise<MerchantRegisterResult> {
  const { merchant_name, owner_name, email, password } = input;

  // Validate input
  if (!merchant_name || !owner_name || !email || !password) {
    throw new Error('Missing required fields: merchant_name, owner_name, email, password');
  }

  // Validate email format (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength (minimum 8 characters)
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Split owner_name into first and last name
  const nameParts = owner_name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  if (!firstName) {
    throw new Error('Owner name must include at least a first name');
  }

  // Use transaction to ensure atomicity
  return await db.transaction(async (client) => {
    // Check if merchant email already exists
    const merchantCheck = await client.query(
      'SELECT id FROM merchants WHERE email = $1',
      [email]
    );

    if (merchantCheck.rows.length > 0) {
      throw new Error('Merchant with this email already exists');
    }

    // Check if user email already exists
    const userCheck = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Create merchant
    const merchantResult = await client.query(
      `INSERT INTO merchants (name, business_name, email, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id, name, business_name, email`,
      [owner_name, merchant_name, email]
    );

    if (merchantResult.rows.length === 0) {
      throw new Error('Failed to create merchant');
    }

    const merchant = merchantResult.rows[0];
    const merchantId = merchant.id;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create merchant_owner user
    const userResult = await client.query(
      `INSERT INTO users (
        merchant_id, 
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, email, first_name, last_name, role, merchant_id`,
      [merchantId, email, passwordHash, firstName, lastName, 'merchant_owner']
    );

    if (userResult.rows.length === 0) {
      throw new Error('Failed to create user');
    }

    const user = userResult.rows[0];

    // Generate JWT tokens
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userType: 'merchant',
      userId: user.id,
      merchantId: user.merchant_id,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role,
        merchantId: user.merchant_id,
      },
      merchant: {
        id: merchant.id,
        name: merchant.business_name || merchant.name,
      },
    };
  });
}

/**
 * Login a merchant user
 * 
 * This function:
 * 1. Finds the user by email
 * 2. Verifies the password
 * 3. Updates last_login_at
 * 4. Generates JWT tokens
 * 
 * @param input - Login credentials
 * @returns User data and tokens
 */
export async function loginMerchant(
  input: MerchantLoginInput
): Promise<MerchantLoginResult> {
  const { email, password } = input;

  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user by email
  const userResult = await db.query(
    `SELECT 
      u.id, 
      u.email, 
      u.password_hash, 
      u.first_name, 
      u.last_name, 
      u.role, 
      u.merchant_id,
      u.is_active,
      m.is_active as merchant_is_active
    FROM users u
    INNER JOIN merchants m ON u.merchant_id = m.id
    WHERE u.email = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = userResult.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw new Error('User account is inactive');
  }

  // Check if merchant is active
  if (!user.merchant_is_active) {
    throw new Error('Merchant account is inactive');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Update last login timestamp
  await db.query(
    'UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Generate JWT tokens
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userType: 'merchant',
    userId: user.id,
    merchantId: user.merchant_id,
    role: user.role,
  };

  const tokens = generateTokens(payload);

  // Get merchant info
  const merchantResult = await db.query(
    'SELECT id, business_name, name FROM merchants WHERE id = $1',
    [user.merchant_id]
  );

  const merchant = merchantResult.rows[0];

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      role: user.role,
      merchantId: user.merchant_id,
    },
    merchant: {
      id: merchant.id,
      name: merchant.business_name || merchant.name,
    },
  };
}

/**
 * Partner registration data
 */
export interface PartnerRegisterInput {
  partner_name: string;
  owner_name: string;
  email: string;
  password: string;
  country?: string;
}

/**
 * Partner login data
 */
export interface PartnerLoginInput {
  email: string;
  password: string;
}

/**
 * Partner registration result
 */
export interface PartnerRegisterResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    partnerId: string;
  };
  partner: {
    id: string;
    name: string;
  };
}

/**
 * Partner login result
 */
export interface PartnerLoginResult {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    partnerId: string;
  };
  partner: {
    id: string;
    name: string;
  };
}

/**
 * Register a new partner and create partner_owner user
 * 
 * This function:
 * 1. Creates a new partner record
 * 2. Hashes the password
 * 3. Creates a partner_owner user for that partner
 * 4. Generates JWT tokens
 * 
 * @param input - Registration data
 * @returns User data, partner data, and tokens
 */
export async function registerPartner(
  input: PartnerRegisterInput
): Promise<PartnerRegisterResult> {
  const { partner_name, owner_name, email, password, country } = input;

  // Validate input
  if (!partner_name || !owner_name || !email || !password) {
    throw new Error('Missing required fields: partner_name, owner_name, email, password');
  }

  // Validate email format (basic)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }

  // Validate password strength (minimum 8 characters)
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }

  // Split owner_name into first and last name
  const nameParts = owner_name.trim().split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  if (!firstName) {
    throw new Error('Owner name must include at least a first name');
  }

  // Use transaction to ensure atomicity
  return await db.transaction(async (client) => {
    // Check if partner email already exists
    const partnerCheck = await client.query(
      'SELECT id FROM partners WHERE email = $1',
      [email]
    );

    if (partnerCheck.rows.length > 0) {
      throw new Error('Partner with this email already exists');
    }

    // Check if user email already exists
    const userCheck = await client.query(
      'SELECT id FROM partner_users WHERE email = $1',
      [email]
    );

    if (userCheck.rows.length > 0) {
      throw new Error('User with this email already exists');
    }

    // Create partner
    const partnerResult = await client.query(
      `INSERT INTO partners (name, business_name, email, country, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING id, name, business_name, email, country`,
      [owner_name, partner_name, email, country || null]
    );

    if (partnerResult.rows.length === 0) {
      throw new Error('Failed to create partner');
    }

    const partner = partnerResult.rows[0];
    const partnerId = partner.id;

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create partner_owner user
    const userResult = await client.query(
      `INSERT INTO partner_users (
        partner_id, 
        email, 
        password_hash, 
        first_name, 
        last_name, 
        role, 
        is_active
      )
      VALUES ($1, $2, $3, $4, $5, $6, true)
      RETURNING id, email, first_name, last_name, role, partner_id`,
      [partnerId, email, passwordHash, firstName, lastName, 'partner_owner']
    );

    if (userResult.rows.length === 0) {
      throw new Error('Failed to create user');
    }

    const user = userResult.rows[0];

    // Generate JWT tokens
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userType: 'partner',
      userId: user.id,
      partnerId: user.partner_id,
      role: user.role,
    };

    const tokens = generateTokens(payload);

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        id: user.id,
        name: `${user.first_name} ${user.last_name}`.trim(),
        email: user.email,
        role: user.role,
        partnerId: user.partner_id,
      },
      partner: {
        id: partner.id,
        name: partner.business_name || partner.name,
      },
    };
  });
}

/**
 * Login a partner user
 * 
 * This function:
 * 1. Finds the user by email
 * 2. Verifies the password
 * 3. Updates last_login_at
 * 4. Generates JWT tokens
 * 
 * @param input - Login credentials
 * @returns User data, partner data, and tokens
 */
export async function loginPartner(
  input: PartnerLoginInput
): Promise<PartnerLoginResult> {
  const { email, password } = input;

  // Validate input
  if (!email || !password) {
    throw new Error('Email and password are required');
  }

  // Find user by email
  const userResult = await db.query(
    `SELECT 
      pu.id, 
      pu.email, 
      pu.password_hash, 
      pu.first_name, 
      pu.last_name, 
      pu.role, 
      pu.partner_id,
      pu.is_active,
      p.is_active as partner_is_active
    FROM partner_users pu
    INNER JOIN partners p ON pu.partner_id = p.id
    WHERE pu.email = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user = userResult.rows[0];

  // Check if user is active
  if (!user.is_active) {
    throw new Error('User account is inactive');
  }

  // Check if partner is active
  if (!user.partner_is_active) {
    throw new Error('Partner account is inactive');
  }

  // Verify password
  const isValidPassword = await verifyPassword(password, user.password_hash);

  if (!isValidPassword) {
    throw new Error('Invalid credentials');
  }

  // Update last login timestamp
  await db.query(
    'UPDATE partner_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = $1',
    [user.id]
  );

  // Generate JWT tokens
  const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
    userType: 'partner',
    userId: user.id,
    partnerId: user.partner_id,
    role: user.role,
  };

  const tokens = generateTokens(payload);

  // Get partner info
  const partnerResult = await db.query(
    'SELECT id, business_name, name FROM partners WHERE id = $1',
    [user.partner_id]
  );

  const partner = partnerResult.rows[0];

  return {
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    user: {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      role: user.role,
      partnerId: user.partner_id,
    },
    partner: {
      id: partner.id,
      name: partner.business_name || partner.name,
    },
  };
}

