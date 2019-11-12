import { subDays, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';

import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res, next) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    // Checkins in a week
    const subDate = subDays(new Date(), 7);

    const checkins = await Checkin.findAll({
      where: {
        student_id: student.id,
        createdAt: {
          [Op.between]: [subDate, new Date()],
        },
      },
    });

    if (checkins.length > 4) {
      return res
        .status(400)
        .json({ error: 'You have reached your limit of checkins this week' });
    }

    // Checkins in a day
    const newDate = new Date();

    const checkDay = await Checkin.findAll({
      where: {
        student_id: student.id,
        createdAt: {
          [Op.between]: [startOfDay(newDate), endOfDay(newDate)],
        },
      },
    });

    if (!(checkDay == 0)) {
      return res.status(400).json({ error: 'You already did checkin today' });
    }

    const checkin = await Checkin.create({
      student_id: student.id,
    });

    return res.json(checkin);
  }

  async index(req, res) {
    const checkins = await Checkin.findAll({
      where: {
        student_id: req.params.id,
      },
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email', 'age'],
        },
      ],
    });

    return res.json(checkins);
  }
}

export default new CheckinController();
