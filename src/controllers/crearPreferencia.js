export const crearPreferencia = async (req, res) => {
  const { tipo, precio } = req.body;

  console.log("dentro del body de crearPref", req.body);
  const preference = {
    items: [
      {
        title: tipo,
        quantity: 1,
        unit_price: Number(precio)
      }
    ],
    back_urls: {
      success: "http://localhost:8080/success",
      failure: "http://localhost:8080/failure",
      pending: "http://localhost:8080/pending"
    },
    //auto_return: "approved"     Descomentar cuando se salga del ambito localhost
  };

  const response = await mercadopago.preferences.create(preference);

  res.json({ init_point: response.body.init_point });
};
