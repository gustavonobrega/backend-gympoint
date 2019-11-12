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
        .status(401)
        .json({ error: 'Only admins can make an registration' });
    }

    const { start_date, student_id, plan_id } = req.body;

    // check for past dates
    const parsedDate = startOfHour(parseISO(start_date));

    if (isBefore(parsedDate, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' });
    }

    // check if student exists
    const student = await Student.findByPk(student_id);
    if (!student) {
      return res.status(400).json({ error: 'Student does not exists' });
    }

    // check if plan exists
    const plan = await Plan.findByPk(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists' });
    }

    const endDate = addMonths(parsedDate, plan.duration);
    const totalPrice = plan.duration * plan.price;

    // check if registration exists
    const registrationExists = await Registration.findOne({
      where: {
        student_id: student.id,
      },
    });

    if (registrationExists) {
      return res.status(400).json({ error: 'Registration already exists' });
    }

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
    const { page = 1 } = req.query;

    const registrations = await Registration.findAll({
      attributes: ['id', 'start_date', 'end_date', 'price', 'active'],
      limit: 20,
      offset: (page - 1) * 20,
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
