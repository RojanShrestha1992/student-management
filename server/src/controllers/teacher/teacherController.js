const Class = require("../../models/Class");
const Attendance = require("../../models/Attendance");
const Grade = require("../../models/Grade");
const User = require("../../models/User");
const fs = require("fs");
const path = require("path");
const { Types } = require("mongoose");
const StudyMaterial = require("../../models/StudyMaterial");

const buildMaterialFileUrl = (req, materialId) => {
  const forwardedProto = req.headers["x-forwarded-proto"];
  const forwardedHost = req.headers["x-forwarded-host"];
  const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : forwardedProto || req.protocol;
  const host = Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost || req.get("host");

  return `${protocol}://${host}/api/v1/materials/${materialId}/file`;
};

const getMyClasses = async (req, res, next) => {
  try {
    const classes = await Class.find({ teacher: req.user.id, isActive: true })
      .sort({ createdAt: -1 });

    const hydratedClasses = await Promise.all(
      classes.map(async (classDoc) => {
        const students = await User.find({
          role: "student",
          "studentDetails.class": classDoc._id,
          isActive: true,
        }).select("name email role studentDetails");

        return {
          ...classDoc.toObject(),
          students,
        };
      })
    );

    return res.status(200).json({ classes: hydratedClasses });
  } catch (error) {
    return next(error);
  }
};

const getClassStudents = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.classId);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (String(classDoc.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed for this class" });
    }

    const students = await User.find({
      role: "student",
      "studentDetails.class": classDoc._id,
      isActive: true,
    }).select("name email role studentDetails profile");

    return res.status(200).json({ students, class: classDoc });
  } catch (error) {
    return next(error);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const { classId, date, records } = req.body;

    if (!classId || !date || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({
        message: "classId, date, and records are required",
      });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (String(classDoc.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed for this class" });
    }

    const attendanceDate = new Date(date);
    const results = [];

    for (const record of records) {
      if (!record.student || !record.status) continue;

      const savedAttendance = await Attendance.findOneAndUpdate(
        {
          class: classId,
          student: record.student,
          date: attendanceDate,
        },
        {
          class: classId,
          student: record.student,
          teacher: req.user.id,
          date: attendanceDate,
          status: record.status,
          remarks: record.remarks,
        },
        { new: true, upsert: true, runValidators: true }
      );

      results.push(savedAttendance);
    }

    return res.status(200).json({
      message: "Attendance saved successfully",
      attendance: results,
    });
  } catch (error) {
    return next(error);
  }
};

const getAttendanceForClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.classId);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (String(classDoc.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed for this class" });
    }

    const attendance = await Attendance.find({ class: req.params.classId })
      .populate("student", "name email role studentDetails")
      .sort({ date: -1 });

    return res.status(200).json({ attendance });
  } catch (error) {
    return next(error);
  }
};

const upsertGrade = async (req, res, next) => {
  try {
    const { classId, student, subject, examType, marksObtained, maxMarks, gradeLetter, remarks, term } = req.body;

    if (!classId || !student || !subject || !examType || marksObtained === undefined || !maxMarks) {
      return res.status(400).json({
        message: "classId, student, subject, examType, marksObtained, and maxMarks are required",
      });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (String(classDoc.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed for this class" });
    }

    const grade = await Grade.findOneAndUpdate(
      {
        class: classId,
        student,
        subject,
        examType,
        term: term || null,
      },
      {
        class: classId,
        student,
        teacher: req.user.id,
        subject,
        examType,
        marksObtained,
        maxMarks,
        gradeLetter,
        remarks,
        term,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: "Grade saved successfully",
      grade,
    });
  } catch (error) {
    return next(error);
  }
};

const getGradesForClass = async (req, res, next) => {
  try {
    const classDoc = await Class.findById(req.params.classId);

    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (String(classDoc.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed for this class" });
    }

    const grades = await Grade.find({ class: req.params.classId })
      .populate("student", "name email role studentDetails")
      .sort({ createdAt: -1 });

    return res.status(200).json({ grades });
  } catch (error) {
    return next(error);
  }
};

const uploadStudyMaterial = async (req, res, next) => {
  try {
    const { classId, title, type, description, dueDate } = req.body;

    if (!classId || !title) {
      return res.status(400).json({
        message: "classId and title are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "File is required" });
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (String(classDoc.teacher) !== String(req.user.id)) {
      return res.status(403).json({ message: "Not allowed for this class" });
    }

    const materialId = new Types.ObjectId();
    const fileUrl = buildMaterialFileUrl(req, materialId);
    const filePath = `materials/${materialId.toString()}/file`;

    const material = await StudyMaterial.create({
      _id: materialId,
      class: classId,
      uploadedBy: req.user.id,
      title: title.trim(),
      type: type || "other",
      description,
      dueDate: dueDate || undefined,
      fileName: req.file.originalname,
      filePath,
      fileUrl,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      fileData: req.file.buffer,
    });

    const savedMaterial = await StudyMaterial.findById(material._id)
      .select("-fileData")
      .populate("class", "name section subject code")
      .populate("uploadedBy", "name email role");

    return res.status(201).json({
      message: "File uploaded successfully",
      material: savedMaterial,
    });
  } catch (error) {
    return next(error);
  }
};

const getStudyMaterialFile = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findById(req.params.materialId).select("+fileData");

    if (!material || !material.isActive) {
      return res.status(404).json({ message: "File not found" });
    }

    if (material.fileData) {
      const fileName = material.fileName || "download";
      const safeFileName = fileName.replace(/"/g, '\\"');

      res.setHeader("Content-Type", material.mimeType || "application/octet-stream");
      res.setHeader("Content-Length", material.fileSize);
      res.setHeader("Content-Disposition", `attachment; filename="${safeFileName}"`);

      return res.status(200).send(material.fileData);
    }

    if (material.filePath) {
      const fallbackPath = path.isAbsolute(material.filePath)
        ? material.filePath
        : path.join(process.cwd(), material.filePath);

      if (fs.existsSync(fallbackPath)) {
        res.setHeader("Content-Type", material.mimeType || "application/octet-stream");
        res.setHeader("Content-Disposition", `attachment; filename="${(material.fileName || "download").replace(/"/g, '\\"')}"`);

        return fs.createReadStream(fallbackPath)
          .on("error", next)
          .pipe(res);
      }
    }

    return res.status(404).json({ message: "File not found" });
  } catch (error) {
    return next(error);
  }
};

const getMyMaterials = async (req, res, next) => {
  try {
    const materials = await StudyMaterial.find({
      uploadedBy: req.user.id,
      isActive: true,
    })
      .select("-fileData")
      .populate("class", "name section subject code")
      .sort({ createdAt: -1 });

    return res.status(200).json({ materials });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getMyClasses,
  getClassStudents,
  markAttendance,
  getAttendanceForClass,
  upsertGrade,
  getGradesForClass,
  uploadStudyMaterial,
  getStudyMaterialFile,
  getMyMaterials,
};
