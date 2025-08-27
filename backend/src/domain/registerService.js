const bcrypt = require('bcryptjs');
const yup = require('yup');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Validación de contraseña fuerte
const passwordSchema = yup.string()
  .required('Password is required')
  .min(8, 'Password too weak')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Esquema de validación para paciente
const patientSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords do not match')
    .required('Confirm password is required'),
  lastName: yup.string().optional(),
  phone: yup.string().optional(),
});

async function registerPatient(data) {
  try {
    await patientSchema.validate(data, { abortEarly: false });

    // Verificar email único
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) {
      return {
        code: 400,
        message: 'Patient already exists',
        payload: { error: ['Patient already exists'] }
      };
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Transacción: crear usuario y paciente juntos (relación 1:1 por id)
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          first_name: data.firstName,
          last_name: data.lastName || null,
          email: data.email,
          password_hash: passwordHash,
          role: 'patient',
        }
      });

      const patient = await tx.patient.create({
        data: {
          id: user.id,
          phone: data.phone || null,
          location_id: 1 
        }
      });

      return { user, patient };
    });

    return {
      code: 201,
      message: 'Patient registered successfully',
      payload: {
        firstName: result.user.first_name,
        email: result.user.email
      }
    };
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return {
        code: 400,
        message: 'Validation error',
        payload: { error: err.errors }
      };
    }
    console.error(err.message);
    return {
      code: 500,
      message: 'Internal server error',
      payload: { error: ['An unexpected error occurred. Please try again later.'] }
    };
  }
}

// Esquema de validación para médico
const doctorSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: passwordSchema,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords do not match')
    .required('Confirm password is required'),
  licenseNumber: yup.string().required('License number required'),
  phone: yup.string().required('Phone is required'),
});

async function registerDoctor(data) {
  try {
    await doctorSchema.validate(data, { abortEarly: false });

    // Verificar email único
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });
    if (existingUser) {
      return {
        code: 400,
        message: 'Doctor already exists',
        payload: { error: ['Doctor already exists'] }
      };
    }

    // Verificar license_number único
    const existingLicense = await prisma.doctor.findFirst({
      where: { license_number: data.licenseNumber }
    });
    if (existingLicense) {
      return {
        code: 400,
        message: 'Doctor already exists',
        payload: { error: ['Doctor already exists'] }
      };
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(data.password, 10);

    // Transacción: crear usuario y doctor juntos (relación 1:1 por id)
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          password_hash: passwordHash,
          role: 'doctor',
        }
      });

      const doctor = await tx.doctor.create({
        data: {
          id: user.id,
          license_number: data.licenseNumber,
          phone: data.phone,
          location_id: 1
        }
      });

      return { user, doctor };
    });

    return {
      code: 201,
      message: 'Doctor registered successfully',
      payload: {
        firstName: result.user.first_name,
        email: result.user.email
      }
    };
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      return {
        code: 400,
        message: 'Validation error',
        payload: { error: err.errors }
      };
    }
    console.error(err.message);
    return {
      code: 500,
      message: 'Internal server error',
      payload: { error: ['An unexpected error occurred. Please try again later.'] }
    };
  }
}

module.exports = { registerPatient, registerDoctor };