const router = require("express").Router();
const Course = require("../models").courseModel;
const courseValidation = require("../validation").courseValidation;

router.use((req, res, next) => {
  console.log("A request is coming to api....");
  next();
});

router.get("/", (req, res) => {
  Course.find({})
    .populate("instructor", ["username", "email"])
    .then((course) => {
      res.send(course);
    })
    .catch(() => {
      res.status(500).send("Error! Cannot get Course");
    });
});

router.get("/instructor/:_instructor_id", (req, res) => {
  let { _instructor_id } = req.params;
  Course.find({ _instructor_id })
    .populate("instructor", ["username", "email"])
    .then((data) => {
      res.send(data);
    })
    .catch(() => {
      res.status(500).send("Cannot get courses data");
    });
});

router.get("/findByName/:name", (req, res) => {
  let { name } = req.params;
  Course.find({ title: name })
    .populate("instructor", ["username", "email"])
    .then((course) => {
      res.status(200).send(course);
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

router.get("/student/:_student_id", (req, res) => {
  let { _student_id } = req.params;
  Course.find({ students: _student_id })
    .populate("instructor", ["username", "email"])
    .then((courses) => {
      res.status(200).send(courses);
    })
    .catch(() => {
      res.status(500).send("cannot get data");
    });
});

router.get("/:_id", (req, res) => {
  let { _id } = req.params;
  Course.findOne({ _id })
    .populate("instructor", ["email"])
    .then((course) => {
      res.send(course);
    })
    .catch((e) => {
      res.send(e);
    });
});

router.post("/", async (req, res) => {
  //validate the input before making a new course
  const { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let { title, description, price } = req.body;
  if (req.user.isStudent()) {
    return res.status(400).send("Only instructor can post a new course");
  }

  let newCourse = new Course({
    title,
    description,
    price,
    instructor: req.user._id,
  });

  try {
    await newCourse.save();
    res.status(200).send("New course has been saved");
  } catch (err) {
    res.status(400).send("Cannot save Course");
  }
});

router.post("/enroll/:_id", async (req, res) => {
  let { _id } = req.params;
  let { user_id } = req.body;
  try {
    let course = await Course.findOne({ _id });
    course.students.push(user_id);
    await course.save();
    res.send("Done Enrollment");
  } catch (err) {
    res.send(err);
  }
});

router.patch("/:_id", async (req, res) => {
  const { error } = courseValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let { _id } = req.params;
  let course = await Course.findOne({ _id });
  if (!course) {
    res.status(404);
    return res.json({
      success: false,
      message: "Course not found",
    });
  }

  if (course.instructor.equals(req.user._id) || req.user.isAdmin) {
    Course.findByIdAndUpdate({ _id }, req.body, {
      new: true,
      runValidators: true,
    })
      .then(() => {
        res.send("Course updated successfully");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    res.status(403);
    return res.json({
      success: false,
      message: "Only the instructor can edit this course",
    });
  }
});

router.delete("/:_id", async (req, res) => {
  let { _id } = req.params;
  let course = Course.findOne({ _id });
  if (!course) {
    res.status(404);
    return res.json({
      success: false,
      message: "Course Not Found",
    });
  }

  if (course.instructor.equals(req.user._id) || req.user.isAdmin) {
    Course.deleteOne({ _id })
      .then(() => {
        res.send("Course Deleted Successfully");
      })
      .catch((e) => {
        res.send({
          success: false,
          message: e,
        });
      });
  } else {
    res.status(403);
    return res.json({
      success: false,
      message: "Only the instructor can edit this course",
    });
  }
});

module.exports = router;
