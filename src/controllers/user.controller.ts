import type { NextFunction, Request, Response } from 'express';
import { UserService } from '../services/user.service.ts';

export class UserController {
  private readonly user: UserService;

  constructor() {
    this.user = new UserService();
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.user.createUser(req.validated.body);

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async createMany(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await this.user.createUsers(req.validated.body);

      return res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  }

  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const user = await this.user.getUser(id);

      if (!user) {
        return res.status(404).json({
          message: 'User not found',
        });
      }

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async getMany(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, limit, ...data } = req.validated.query;

      const query = {
        data,
        page: Number(page),
        take: Number(limit),
      };

      const users = await this.user.getUsers(query);

      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);
      const data = req.validated.body;

      const user = await this.user.updateUser(id, data);

      if (!user) {
        return res.status(400).json({
          message: 'User not found',
        });
      }

      return res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  async updateMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];
      const data = req.validated.body.data;

      const users = await this.user.updateUsers(ids, data);

      return res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = Number(req.validated.params.id);

      const result = await this.user.deleteUser(id);

      if (!result) {
        return res.status(400).json({ message: 'User not found' });
      }
    } catch (error) {
      next(error);
    }
  }

  async deleteMany(req: Request, res: Response, next: NextFunction) {
    try {
      const ids = req.validated.body.ids as number[];

      const result = await this.user.deleteUsers(ids);

      if (!result) {
        return res.status(400).json({ message: 'User not found' });
      }
    } catch (error) {
      next(error);
    }
  }
}
