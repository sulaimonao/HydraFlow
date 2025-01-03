// src/util/validation.js
import Joi from 'joi';

// Define your schema
const taskSchema = Joi.object({
  user_id: Joi.string().required(),
  chatroom_id: Joi.string().required(),
  task: Joi.string().required(),
  description: Joi.string().optional(),
  priority: Joi.string().valid('High', 'Medium', 'Low').default('High'),
  subtasks: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      status: Joi.string().valid('pending', 'completed').default('pending'),
    })
  ),
});

// Validation function
export const validateTaskInput = (data) => {
  const { error, value } = taskSchema.validate(data);
  if (error) {
    throw new Error(`Validation error: ${error.message}`);
  }
  return value;
};
