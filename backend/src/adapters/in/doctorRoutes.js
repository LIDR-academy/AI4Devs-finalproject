const express = require('express');
const router = express.Router();
const { searchDoctors } = require('../../domain/doctorService');
const { getDoctorProfile } = require('../../application/getDoctorProfile');
const yup = require('yup');

// Esquema de validación Yup para búsqueda
const searchSchema = yup.object().shape({
  specialty_id: yup.number().integer().positive().nullable(true),
  city_id: yup.number().integer().positive().nullable(true),
  state_id: yup.number().integer().positive().nullable(true),
  page: yup.number().integer().positive().default(1),
  limit: yup.number().integer().positive().max(100).default(10)
});

// Endpoint de búsqueda de especialistas
router.get('/search', async (req, res, next) => {
  try {
    // Validar parámetros de consulta
    const validated = await searchSchema.validate(req.query, { abortEarly: false, stripUnknown: true });

    const data = await searchDoctors({
      specialtyId: validated.specialty_id,
      cityId: validated.city_id,
      stateId: validated.state_id,
      page: validated.page,
      limit: validated.limit
    });

    res.locals.message = 'success';
    res.json(data);
  } catch (err) {
    // Si es error de validación Yup, estructurarlo para el middleware
    if (err.name === 'ValidationError') {
      err.statusCode = 400;
      err.errors = err.errors || ['Invalid query parameters'];
      err.message = 'Bad Request';
      return next(err);
    }
    next(err);
  }
});

// ...existing code...


// Esquema de validación Yup para id de doctor
const doctorIdSchema = yup.object({
  id: yup
    .number()
    .integer()
    .positive()
    .required('Doctor id is required')
});


// Endpoint para consultar perfil de especialista
router.get('/:id', async (req, res, next) => {
  try {
    // Validación de parámetro id
    const validated = await doctorIdSchema.validate({ id: Number(req.params.id) }, { abortEarly: false });

    // Aquí se debe implementar la lógica de autenticación en el futuro
    // const isAuthenticated = false; // <-- Implementar autenticación

    const profile = await getDoctorProfile(validated.id);

    if (!profile) {
      const error = new Error('Doctor not found');
      error.statusCode = 404;
      error.errors = ['Doctor with specified ID does not exist'];
      return next(error);
    }

    // Ocultar datos sensibles si el usuario no está autenticado
    // if (!isAuthenticated) {
    //   // No incluir correo, teléfono, dirección exacta
    // }

    // Solo incluir los campos permitidos para visitantes
    const publicProfile = {
      id: profile.id,
      name: profile.name,
      specialty: profile.specialty,
      biography: profile.biography,
      photo: profile.photo,
      licenseNumber: profile.licenseNumber,
      title: profile.title,
      city: profile.city,
      state: profile.state
    };

    res.locals.message = 'success';
    res.json(publicProfile);
  } catch (err) {
    if (err.name === 'ValidationError') {
      err.statusCode = 400;
      err.errors = err.errors || ['Invalid doctor id'];
      err.message = 'Bad Request';
      return next(err);
    }
    next(err);
  }
});

module.exports = router;