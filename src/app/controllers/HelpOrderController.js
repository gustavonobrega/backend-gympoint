import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class HelpOrderController {
  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    const { question } = req.body;

    const helpOrder = await HelpOrder.create({
      student_id: student.id,
      question,
    });

    return res.json(helpOrder);
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const helpOrders = await HelpOrder.findAll({
      where: {
        student_id: req.params.id,
      },
      attributes: ['id', 'question', 'answer', 'answer_at'],
      limit: 2,
      offset: (page - 1) * 2,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email', 'age'],
        },
      ],
    });

    return res.json(helpOrders);
  }
}

export default new HelpOrderController();
