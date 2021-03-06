import * as Yup from 'yup';
import Plan from '../models/Plan';

class PlanController {
  async store(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string().required(),
      duration: Yup.number()
        .integer()
        .required(),
      price: Yup.number().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const existsPlan = await Plan.findOne({
      where: { title: req.body.title },
    });

    if (existsPlan) {
      return res.status(401).json({ error: 'Plan already exists' });
    }

    const { title, duration, price } = await Plan.create(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async index(req, res) {
    const { page = 1 } = req.query;
    const pageLimit = 5;

    const { rows: plans, count } = await Plan.findAndCountAll({
      limit: pageLimit,
      offset: (page - 1) * pageLimit,
    });

    return res.json({ plans, lastPage: Math.ceil(count / pageLimit) });
  }

  async show(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    if (!plan) {
      return res.status(400).json({ error: 'Plan does not exists!' });
    }

    return res.json(plan);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      title: Yup.string(),
      duration: Yup.number().integer(),
      price: Yup.number(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validations fails' });
    }

    const { title } = req.body;

    const plan = await Plan.findByPk(req.params.id);

    if (title !== plan.title) {
      const existsPlan = await Plan.findOne({ where: { title } });

      if (existsPlan) {
        return res.status(401).json({ error: 'Plan already exists' });
      }
    }

    const { duration, price } = await plan.update(req.body);

    return res.json({
      title,
      duration,
      price,
    });
  }

  async delete(req, res) {
    const plan = await Plan.findByPk(req.params.id);

    await plan.destroy();

    return res.send();
  }
}

export default new PlanController();
