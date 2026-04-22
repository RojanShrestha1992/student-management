const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Class = require("../models/Class");
const Attendance = require("../models/Attendance");
const Grade = require("../models/Grade");

dotenv.config();

const SAMPLE_PASSWORD = "Pass123!";
const SAMPLE_TERM = "2026-Spring";

const teachersSeed = [
  {
    name: "Aarav Sharma",
    email: "teacher.aarav@sms.local",
    role: "teacher",
    isActive: true,
    profile: {
      phone: "9800000001",
      gender: "male",
      address: "Kathmandu",
    },
    teacherDetails: {
      employeeId: "T-SMP-001",
      department: "Science",
      assignedClasses: [],
    },
  },
  {
    name: "Maya Thapa",
    email: "teacher.maya@sms.local",
    role: "teacher",
    isActive: true,
    profile: {
      phone: "9800000002",
      gender: "female",
      address: "Lalitpur",
    },
    teacherDetails: {
      employeeId: "T-SMP-002",
      department: "Mathematics",
      assignedClasses: [],
    },
  },
];

const classesSeed = [
  {
    key: "science-10-a",
    name: "Grade 10",
    section: "A",
    subject: "Science",
    code: "SMP-SCI-10-A",
    schedule: {
      days: ["Mon", "Wed", "Fri"],
      startTime: "10:00",
      endTime: "11:00",
      room: "Lab-1",
    },
    teacherEmail: "teacher.aarav@sms.local",
  },
  {
    key: "math-10-b",
    name: "Grade 10",
    section: "B",
    subject: "Mathematics",
    code: "SMP-MTH-10-B",
    schedule: {
      days: ["Tue", "Thu", "Sat"],
      startTime: "09:00",
      endTime: "10:00",
      room: "Room-5",
    },
    teacherEmail: "teacher.maya@sms.local",
  },
];

const studentsSeed = [
  {
    name: "Rohan Karki",
    email: "student.rohan@sms.local",
    classKey: "science-10-a",
    rollNumber: "10A-01",
    admissionNumber: "ADM-10A-001",
    guardianName: "Sanjay Karki",
    guardianPhone: "9811111101",
    gender: "male",
  },
  {
    name: "Sita Rai",
    email: "student.sita@sms.local",
    classKey: "science-10-a",
    rollNumber: "10A-02",
    admissionNumber: "ADM-10A-002",
    guardianName: "Bina Rai",
    guardianPhone: "9811111102",
    gender: "female",
  },
  {
    name: "Nabin Gurung",
    email: "student.nabin@sms.local",
    classKey: "science-10-a",
    rollNumber: "10A-03",
    admissionNumber: "ADM-10A-003",
    guardianName: "Prakash Gurung",
    guardianPhone: "9811111103",
    gender: "male",
  },
  {
    name: "Anita Shrestha",
    email: "student.anita@sms.local",
    classKey: "math-10-b",
    rollNumber: "10B-01",
    admissionNumber: "ADM-10B-001",
    guardianName: "Ramesh Shrestha",
    guardianPhone: "9822222201",
    gender: "female",
  },
  {
    name: "Kiran BC",
    email: "student.kiran@sms.local",
    classKey: "math-10-b",
    rollNumber: "10B-02",
    admissionNumber: "ADM-10B-002",
    guardianName: "Mohan BC",
    guardianPhone: "9822222202",
    gender: "male",
  },
  {
    name: "Pooja Adhikari",
    email: "student.pooja@sms.local",
    classKey: "math-10-b",
    rollNumber: "10B-03",
    admissionNumber: "ADM-10B-003",
    guardianName: "Gita Adhikari",
    guardianPhone: "9822222203",
    gender: "female",
  },
];

const getGradeLetter = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "D";
};

const toStartOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const upsertUser = async (payload) => {
  const existing = await User.findOne({ email: payload.email.toLowerCase() });

  if (!existing) {
    return User.create({
      ...payload,
      password: SAMPLE_PASSWORD,
      email: payload.email.toLowerCase(),
    });
  }

  existing.name = payload.name;
  existing.role = payload.role;
  existing.isActive = payload.isActive;
  existing.profile = payload.profile;
  existing.teacherDetails = payload.teacherDetails;
  existing.studentDetails = payload.studentDetails;
  existing.password = SAMPLE_PASSWORD;
  await existing.save();

  return existing;
};

const seed = async () => {
  try {
    await connectDB();

    const teacherMap = new Map();
    const classMap = new Map();

    for (const teacherPayload of teachersSeed) {
      const teacher = await upsertUser(teacherPayload);
      teacherMap.set(teacherPayload.email, teacher);
    }

    for (const classPayload of classesSeed) {
      const teacher = teacherMap.get(classPayload.teacherEmail);
      const existingClass = await Class.findOne({ code: classPayload.code });

      if (!existingClass) {
        const created = await Class.create({
          name: classPayload.name,
          section: classPayload.section,
          subject: classPayload.subject,
          code: classPayload.code,
          teacher: teacher._id,
          students: [],
          schedule: classPayload.schedule,
          isActive: true,
          createdBy: teacher._id,
        });

        classMap.set(classPayload.key, created);
      } else {
        existingClass.name = classPayload.name;
        existingClass.section = classPayload.section;
        existingClass.subject = classPayload.subject;
        existingClass.teacher = teacher._id;
        existingClass.schedule = classPayload.schedule;
        existingClass.isActive = true;
        existingClass.createdBy = teacher._id;
        await existingClass.save();

        classMap.set(classPayload.key, existingClass);
      }
    }

    for (const teacherPayload of teachersSeed) {
      const teacher = teacherMap.get(teacherPayload.email);
      const assignedClassIds = classesSeed
        .filter((item) => item.teacherEmail === teacherPayload.email)
        .map((item) => classMap.get(item.key)?._id)
        .filter(Boolean);

      teacher.teacherDetails = {
        ...(teacher.teacherDetails || {}),
        employeeId: teacherPayload.teacherDetails.employeeId,
        department: teacherPayload.teacherDetails.department,
        assignedClasses: assignedClassIds,
      };

      await teacher.save();
    }

    const seededStudents = [];

    for (const studentPayload of studentsSeed) {
      const classDoc = classMap.get(studentPayload.classKey);
      const student = await upsertUser({
        name: studentPayload.name,
        email: studentPayload.email,
        role: "student",
        isActive: true,
        profile: {
          phone: studentPayload.guardianPhone,
          gender: studentPayload.gender,
          address: "Kathmandu",
        },
        studentDetails: {
          rollNumber: studentPayload.rollNumber,
          admissionNumber: studentPayload.admissionNumber,
          class: classDoc._id,
          guardianName: studentPayload.guardianName,
          guardianPhone: studentPayload.guardianPhone,
        },
      });

      seededStudents.push(student);
    }

    const classDocs = Array.from(classMap.values());
    for (const classDoc of classDocs) {
      const studentsInClass = seededStudents
        .filter((student) => String(student.studentDetails?.class) === String(classDoc._id))
        .map((student) => student._id);

      classDoc.students = studentsInClass;
      await classDoc.save();
    }

    const classIds = classDocs.map((item) => item._id);
    const studentIds = seededStudents.map((item) => item._id);

    await Attendance.deleteMany({ class: { $in: classIds }, student: { $in: studentIds } });
    await Grade.deleteMany({ class: { $in: classIds }, student: { $in: studentIds } });

    const attendanceDocs = [];
    for (let dayOffset = 1; dayOffset <= 5; dayOffset += 1) {
      const day = toStartOfDay(new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000));

      for (const student of seededStudents) {
        const classDoc = classDocs.find((item) => String(item._id) === String(student.studentDetails.class));
        if (!classDoc) continue;

        const statusCycle = ["present", "present", "late", "absent", "present"];
        const studentHash = Array.from(student._id.toString()).reduce(
          (sum, char) => sum + char.charCodeAt(0),
          0
        );
        const status = statusCycle[(dayOffset + studentHash) % statusCycle.length];

        attendanceDocs.push({
          class: classDoc._id,
          student: student._id,
          teacher: classDoc.teacher,
          date: day,
          status,
          remarks: status === "absent" ? "Needs follow-up" : "",
        });
      }
    }

    if (attendanceDocs.length) {
      await Attendance.insertMany(attendanceDocs);
    }

    const gradeDocs = [];
    const examTypes = ["assignment", "quiz", "midterm"];

    for (const student of seededStudents) {
      const classDoc = classDocs.find((item) => String(item._id) === String(student.studentDetails.class));
      if (!classDoc) continue;

      for (const examType of examTypes) {
        const seedNumber = Number(student._id.toString().slice(-2)) || 10;
        const maxMarks = examType === "midterm" ? 100 : 20;
        const marksObtained = Math.min(maxMarks, Math.max(8, Math.round((seedNumber % maxMarks) * 0.8)));
        const percentage = (marksObtained / maxMarks) * 100;

        gradeDocs.push({
          class: classDoc._id,
          student: student._id,
          teacher: classDoc.teacher,
          subject: classDoc.subject,
          examType,
          marksObtained,
          maxMarks,
          gradeLetter: getGradeLetter(percentage),
          remarks: "Seeded sample record",
          term: SAMPLE_TERM,
        });
      }
    }

    if (gradeDocs.length) {
      await Grade.insertMany(gradeDocs);
    }

    console.log("Sample seed completed.");
    console.log("Teacher logins:");
    console.log(` - teacher.aarav@sms.local / ${SAMPLE_PASSWORD}`);
    console.log(` - teacher.maya@sms.local / ${SAMPLE_PASSWORD}`);
    console.log("Student logins:");
    console.log(` - student.rohan@sms.local / ${SAMPLE_PASSWORD}`);
    console.log(` - student.sita@sms.local / ${SAMPLE_PASSWORD}`);
    console.log(` - student.nabin@sms.local / ${SAMPLE_PASSWORD}`);
    console.log(` - student.anita@sms.local / ${SAMPLE_PASSWORD}`);
    console.log(` - student.kiran@sms.local / ${SAMPLE_PASSWORD}`);
    console.log(` - student.pooja@sms.local / ${SAMPLE_PASSWORD}`);
  } catch (error) {
    console.error("Sample seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seed();
