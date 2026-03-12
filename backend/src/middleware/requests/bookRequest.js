import Joi from 'joi';

export const validateBookStore = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().min(3).required(),
    author: Joi.string().required(),
    price: Joi.number().precision(2).required(),
    stock: Joi.number().integer().min(0),
    publishedYear: Joi.number().integer().min(0),
  });
                                                                      
  const { error } = schema.validate(req.body);
  
  if (error) {
    return res.status(422).json({ 
      message: "Validation Failed", 
      errors: error.details.map(err => err.message) 
    });
  }
  next();
};