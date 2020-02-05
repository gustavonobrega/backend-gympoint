import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import HelpOrderMail from '../jobs/HelpOrderMail';
import Queue from '../../lib/Queue';

class AnswerController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const pageLimit = 5;

    const { rows: helpOrder, count } = await HelpOrder.findAndCountAll({
      where: { answer: null },
      attributes: ['id', 'question'],
      limit: pageLimit,
      offset: (page - 1) * pageLimit,
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    return res.json({ helpOrder, lastPage: Math.ceil(count / pageLimit) });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const checkOrder = await HelpOrder.findByPk(req.params.id);

    if (!checkOrder) {
      return res.status(400).json({ error: 'HelpOrder not found' });
    }

    await checkOrder.update({
      ...req.body,
      answer_at: new Date(),
    });

    const helpOrderData = await HelpOrder.findByPk(req.params.id, {
      attributes: ['id', 'question', 'answer', 'answer_at'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['id', 'name', 'email'],
        },
      ],
    });

    await Queue.add(HelpOrderMail.key, {
      helpOrderData,
    });

    return res.json({
      helpOrderData,
    });
  }
}

export default new AnswerController();
