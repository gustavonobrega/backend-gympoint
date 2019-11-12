import Mail from '../../lib/Mail';

class HelpOrderMail {
  get key() {
    return 'HelpOrderMail';
  }

  async handle({ data }) {
    const { helpOrderData } = data;

    await Mail.sendMail({
      to: `${helpOrderData.student.name} <${helpOrderData.student.email}>`,
      subject: 'Resposta Gympoint',
      template: 'helporder',
      context: {
        student: helpOrderData.student.name,
        question: helpOrderData.question,
        answer: helpOrderData.answer,
      },
    });
  }
}

export default new HelpOrderMail();
