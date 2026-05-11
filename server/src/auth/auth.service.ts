import { Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { User, UserDocument } from "./users.schema";
import { Model } from "mongoose";

import * as password from 'password-hash-and-salt';
import * as jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';


@Injectable()
export class AuthService {

     SALT_ROUNDS = 10;
    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) { }

    async login(username: string, plainPassword: string) {
        const user = await this.userModel.findOne({ username });
        console.log(user);

        if (!user) {
            console.log("User don't exist in database!");
            throw new UnauthorizedException();
        }

        const isPasswordCorrect = await this.comparePassword(plainPassword, user.passwordHash);

        if(!isPasswordCorrect) {
            console.log("Wrong password!");
            throw new UnauthorizedException();
        }

        const authJwtToken = jwt.sign({username, roles: user.roles}, process.env.JWT_S);
        return {authJwtToken, user: {username: user.username, roles: user.roles}}; // Return token and user info

    }

    async create(username: string, plainPassword: string) {

        // const newUser: any = {};
        // newUser.username = 'magacinGP';
        // newUser.roles = [];
        // // newUser.roles.push('ADMIN');
        // newUser.roles.push('MGP');
        // console.log('ovde sam sad', newUser);

        // const hashPassword = await this.hashPassword('mgp_2026');
        // newUser.passwordHash = hashPassword;
        // console.log(newUser);
        // const createdUser = new this.userModel(newUser);

        // return createdUser.save();

    }

    // Hash password
async hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(this.SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error: any) {
    throw new Error('Error hashing password: ' + error.message);
  }
}

// Compare password with hash
async comparePassword(password, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error: any) {
    throw new Error('Error comparing password: ' + error.message);
  }
}
}