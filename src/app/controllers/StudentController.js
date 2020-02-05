import * as Yup from 'yup';
import { Op } from 'sequelize';
import Student from '../models/Student';

class StudentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      age: Yup.number()
        .integer()
        .required(),
      height: Yup.number().required(),
      weight: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const studentExists = await Student.findOne({
      where: { email: req.body.email },
    });

    if (studentExists) {
      return res.status(401).json({ error: 'Student already exists' });
    }

    const student = await Student.create(req.body);

    return res.json(student);
  }

  async index(req, res) {
    const { page = 1, queryName } = req.query;
    const pageLimit = 5;

    const { rows: students, count } = await Student.findAndCountAll({
      where: queryName ? { name: { [Op.iLike]: `%${queryName}%` } } : {},
      limit: pageLimit,
      offset: (page - 1) * pageLimit,
    });

    return res.json({ students, lastPage: Math.ceil(count / pageLimit) });
  }

  async show(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists!' });
    }

    return res.json(student);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      age: Yup.number().integer(),
      height: Yup.number(),
      weight: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { email } = req.body;

    const student = await Student.findByPk(req.params.id);

    if (email !== student.email) {
      const studentExists = await Student.findOne({ where: { email } });

      if (studentExists) {
        return res.status(400).json({ error: 'Student already exists' });
      }
    }

    await student.update(req.body);

    return res.json(req.body);
  }

  async delete(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student does not exists!' });
    }

    await student.destroy();

    return res.send();
  }
}

export default new StudentController();
