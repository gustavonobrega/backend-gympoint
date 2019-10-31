import { startOfHour, parseISO, isBefore, addMonths } from 'date-fns';
import * as Yup from 'yup';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Registration from '../models/Registration';
import RegistrationMail from '../jobs/RegistrationMail';
import Queue from '../../lib/Queue';

class RegistrationController {
  async store(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date().required(),
      student_id: Yup.number().required(),
      plan_id: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    if (!req.userId) {
      return res
        .status(400)
        .json({ error: 'Only admins can make an registration' });
    }

    const { start_date, student_id, plan_id } = req.body;

    // check for past dates
    const parsedDate = startOfHour(parseISO(start_date));

    if (isBefore(parsedDate, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }

    // check if student exists
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    // check if plan exists
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    const endDate = addMonths(parsedDate, plan.duration);
    const totalPrice = plan.duration * plan.price;

    const registration = await Registration.create({
      ...req.body,
      end_date: endDate,
      price: totalPrice,
    });

    await Queue.add(RegistrationMail.key, {
      student,
      plan,
      registration,
    });

    return res.json(registration);
  }

  async index(req, res) {
    const registrations = await Registration.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['id', 'title', 'duration'],
        },
      ],
    });

    return res.json(registrations);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      start_date: Yup.date(),
      student_id: Yup.number(),
      plan_id: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(401).json({ error: 'Registration does not exists.' });
    }

    const { start_date, student_id, plan_id } = req.body;

    const parsedDate = startOfHour(parseISO(start_date));
    if (isBefore(parsedDate, new Date())) {
      return res.status(401).json({ error: 'Past dates are not permitted' });
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(401).json({ error: 'Student does not exists' });
    }

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(401).json({ error: 'Plan does not exists' });
    }

    const endDate = addMonths(parsedDate, plan.duration);
    const totalPrice = plan.duration * plan.price;

    const { id, end_date, price } = await registration.update({
      ...req.body,
      end_date: endDate,
      price: totalPrice,
    });

    return res.json({
      id,
      student_id,
      plan_id,
      start_date,
      end_date,
      price,
    });
  }

  async delete(req, res) {
    const registration = await Registration.findByPk(req.params.id);

    if (!registration) {
      return res.status(401).json({ error: 'Registration does not exists.' });
    }

    await registration.destroy();

    return res.json(registration);
  }
}

export default new RegistrationController();

/**
import { parseISO, isBefore, addMonths } from 'date-fns';

import Student from '../models/Student';
import Plan from '../models/Plan';
import Registration from '../models/Registration';

import { storeSchema } from '../validations/Registration';

class RegistrationController {
  async store(req, res) {
    try {
      await storeSchema.validate(req.body);
    } catch (err) {
      return res.status(400).json({ error: 'Falha na validação dos campos' });
    }

    if (!req.userId) {
      return res.status(401).json({ error: 'Usuário não autorizado' });
    }

    const { start_date, student_id, plan_id } = req.body;
    const parsedStartDate = parseISO(start_date);

    if (isBefore(parsedStartDate, new Date())) {
      return res
        .status(400)
        .json({ error: 'Não é permitido fazer matricula em data passada' });
    }

    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Aluno não encontrado' });
    }

    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plano não encontrado' });
    }

    const endDate = addMonths(parsedStartDate, plan.duration);
    const TotalPrice = plan.price * plan.duration;

    const registration = await Registration.create({
      ...req.body,
      end_date: endDate,
      price: TotalPrice,
    });

    return res.json(registration);
  }
}

export default new RegistrationController();
 */
