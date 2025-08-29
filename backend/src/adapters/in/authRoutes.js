const express = require('express');
const { registerPatient, registerDoctor } = require('../../domain/registerService');
const { loginUser } = require('../../domain/authService');


const router = express.Router();

/**
 * POST /api/auth/register/patient
 * Registro de paciente
 */
router.post('/register/patient', async (req, res, next) => {
  try {
    const result = await registerPatient(req.body);
    res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/register/doctor
 * Registro de médico especialista
 */
router.post('/register/doctor', async (req, res, next) => {
  try {
    const result = await registerDoctor(req.body);
    res.status(result.code).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login/patient
 * Login para pacientes
 */
router.post('/login/patient', async (req, res, next) => {
  try {
    const result = await loginUser(req.body, 'patient');
    res.locals.message = 'Login successful';
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/auth/login/doctor
 * Login para médicos especialistas
 */
router.post('/login/doctor', async (req, res, next) => {
  try {
    const result = await loginUser(req.body, 'doctor');
    res.locals.message = 'Login successful';
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;