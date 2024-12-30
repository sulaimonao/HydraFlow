// src/util/validation.js
import Joi from "joi";

const taskSchema = Joi.object({
  goal: Joi.string().required(),
  priority: Joi.string().valid("High", "Medium", "Low").default("High"),
  subtasks: Joi.array().items(
    Joi.object({
      description: Joi.string().required(),
      status: Joi.string().valid("pending", "completed").default("pending"),
    })
  ),
});

export async function validateTaskInput(taskInput) {
  const { error, value } = taskSchema.validate(taskInput);
  if (error) throw new Error(`Invalid task input: ${error.message}`);
  return value;
}
