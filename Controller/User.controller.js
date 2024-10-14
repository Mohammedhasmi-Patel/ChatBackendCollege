import User from "../Models/User.model.js";
import bcrypt from "bcryptjs";
import createTokenAndSaveCookie from "../jwt/generateToken.jwt.js";

export const signUp = async (req, res) => {
  try {
    const { fullname, email, password, confirmPassword } = req.body;

    // check that password and confirm password is same or not.
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Password not match." });
    }

    // condition for check user already exist
    const user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ error: "email already exist" });
    }

    // before saving the pass on dbs first hashing algo use here.
    const hashedPassword = await bcrypt.hash(password, 10);

    // everything is fine
    const newUser = new User({
      fullname,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    if (newUser) {
      // this is we will got from mongodb dbs
      const token = createTokenAndSaveCookie(newUser._id, res);
      return res
        .status(201)
        .json({ message: "User Created succesfullly...", newUser, token });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
};

// this for handling login page
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    // it's not existing user
    if (!user) {
      return res.status(401).json({
        error: "User not found. Please check the email and try again.",
      });
    }
    // email is right now go for password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ error: "password is incorrect" });
    }
    // means email and pass both are correct now go for generating token
    else {
      const token = createTokenAndSaveCookie(user._id, res);

      return res.status(200).json({
        message: "user login successfully..",
        user: {
          _id: user._id,
          fullname: user.fullname,
          email: user.email,
          token,
        },
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error" });
  }
};

// logout functionality
export const logout = (req, res) => {
  try {
    res.clearCookie("jwt");
    res.status(200).json({ message: "user logged our sucessfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "internal server error.." });
  }
};

// create api to fetch all the data from the batabase
export const allUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    console.log(`logged in user is ${loggedInUser}`);
    const filteredUser = await User.find({ _id: { $ne: loggedInUser } }).select(
      "-password"
    );
    res.status(201).json(filteredUser);
  } catch (error) {
    console.log(`error in all controller users ${error}`);
    res.status(500).json({ error: "internal server error" });
  }
};
