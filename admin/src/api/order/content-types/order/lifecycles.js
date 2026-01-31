module.exports = {
  async afterCreate(event) {
    const { result } = event;
    await strapi.plugin('email').service('email').send({
      to: result.phone + '@example.com'? Wait, phone is not email. If email in orderData, add field in Strapi model for email.
      // Assume add email field to order
      to: result.email,
      from: 'shop@example.com',
      subject: 'Подтверждение заказа',
      text: `Заказ #${result.id} оформлен.`,
    });
  },
};