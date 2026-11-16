import { signupUser, loginUser, getCurrentUser } from '../services/authService.js';

export async function signup(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await signupUser({ email, password });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}
