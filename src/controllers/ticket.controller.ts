import { Request, Response } from "express";

// GET /tickets
export const getAll = async (req: Request, res: Response) => {
  try {
    // Service call, to list all tickets
    res.send({ tickets: [] })
  } catch (err: unknown) {
    res.status(500).json(err)
  }
}

// POST: /tickets
export const createOne = async (req: Request, res: Response) => {
  const { ticket } = req.body;

  try {
    // Service call, to create a new ticket
    res.json({ ticket })
  } catch (err: unknown) {
    res.status(500).json(err)
  }
}

// PUT: /tickets/{id}
export const updateById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { ticket } = req.body;

  try {
    // Service call, to update a ticket by it's id
    res.json({ id, ticket })
  } catch (err: unknown) {
    res.status(500).json(err)
  }
}