import { apiErrorMessage } from "../../utils/validation";
import { useState, useEffect } from "react";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import { StatusBadge } from "../../components/Badges.jsx";

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from "../../api/studentApi";

const emptyForm = {
  student_id: "",
  first_name: "",
  last_name: "",
  email: "",
  gender: "Male",
  age: 18,
  department: "",
  semester: 1,
  cgpa: 0,
  attendance: 0,
  phone: "",
  address: "",
  status: "Active",
  teacher_id: "",
};

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({ ...emptyForm });

  useEffect(() => {
    loadStudents();
  }, []);

  async function loadStudents() {
    try {
      setError("");

      const res = await getStudents();

      setStudents(res?.students || []);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading Students...
      </div>
    );
  }

  const openAdd = () => {
    setError("");
    setActive(null);
    setForm({ ...emptyForm });
    setModal("add");
  };

  const openEdit = (row) => {
    setError("");
    setActive(row);

    setForm({
      student_id: row.student_id || "",
      first_name: row.first_name || "",
      last_name: row.last_name || "",
      email: row.email || "",
      gender: row.gender || "Male",
      age: row.age ?? 18,
      department: row.department || "",
      semester: row.semester ?? 1,
      cgpa: row.cgpa ?? 0,
      attendance: row.attendance ?? 0,
      phone: row.phone || "",
      address: row.address || "",
      status: row.status || "Active",
      teacher_id: row.teacher_id || "",
    });

    setModal("edit");
  };

  const openDelete = (row) => {
    setError("");
    setActive(row);
    setModal("delete");
  };

  const close = () => {
    setModal(null);
    setActive(null);
    setForm({ ...emptyForm });
  };

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (modal === "add") {
        await createStudent(form);
      }

      if (modal === "edit") {
        await updateStudent(active.student_id, form);
      }

      await loadStudents();
      close();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!active?.student_id) return;

    try {
      setError("");

      await deleteStudent(active.student_id);

      await loadStudents();

      close();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const columns = [
    {
      key: "student_id",
      label: "Student ID",
    },

    {
      key: "first_name",
      label: "First Name",
    },

    {
      key: "last_name",
      label: "Last Name",
    },

    {
      key: "department",
      label: "Department",
    },

    {
      key: "semester",
      label: "Semester",
    },

    {
      key: "cgpa",
      label: "CGPA",
    },

    {
      key: "attendance",
      label: "Attendance",
      render: (row) => `${row.attendance ?? 0}%`,
    },

    {
      key: "status",
      label: "Status",
      render: (row) => (
        <StatusBadge
          value={(row.status || "Active").toLowerCase()}
        />
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm text-slate-500">
            {students.length} students on record.
          </p>

          <p className="text-xs text-slate-400 mt-1">
            Full CRUD, search, and risk filtering.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="btn-primary"
        >
          + Add Student
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Students Table */}
      <DataTable
        columns={columns}
        rows={students}
        searchKeys={[
          "student_id",
          "first_name",
          "last_name",
          "email",
          "department",
        ]}
        filters={[]}
        renderActions={(row) => (
          <div className="flex justify-end gap-2">

            <button
              onClick={() => openEdit(row)}
              className="text-xs font-medium text-navy-900 dark:text-cream-100 hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => openDelete(row)}
              className="text-xs font-medium text-red-500 hover:underline"
            >
              Delete
            </button>

          </div>
        )}
      />

      {/* Add / Edit Student */}
      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={close}
        title={
          modal === "add"
            ? "Add Student"
            : "Edit Student"
        }
      >
        <form
          onSubmit={submit}
          className="space-y-4"
        >

          {/* Student ID / First Name */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Student ID
              </label>

              <input
                className="input"
                required
                disabled={modal === "edit"}
                value={form.student_id}
                pattern="[A-Za-z0-9_-]{3,20}"
                minLength={3}
                maxLength={20}
                onChange={(e) =>
                  handleChange(
                    "student_id",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                First Name
              </label>

              <input
                className="input"
                required
                minLength={2}
                maxLength={50}
                pattern="[A-Za-z]+(?: [A-Za-z]+)*"
                value={form.first_name}
                onChange={(e) =>
                  handleChange(
                    "first_name",
                    e.target.value
                  )
                }
              />
            </div>

          </div>

          {/* Last Name */}
          <div>
            <label className="label">
              Last Name
            </label>

            <input
              className="input"
              required
              minLength={2}
              maxLength={50}
              pattern="[A-Za-z]+(?: [A-Za-z]+)*"
              value={form.last_name}
              onChange={(e) =>
                handleChange(
                  "last_name",
                  e.target.value
                )
              }
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">
              Email
            </label>

            <input
              className="input"
              type="email"
              required
              value={form.email}
              onChange={(e) =>
                handleChange(
                  "email",
                  e.target.value
                )
              }
            />
          </div>

          {/* Gender / Age */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Gender
              </label>

              <select
                className="input"
                value={form.gender}
                onChange={(e) =>
                  handleChange(
                    "gender",
                    e.target.value
                  )
                }
              >
                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>

                <option value="Other">
                  Other
                </option>
              </select>
            </div>

            <div>
              <label className="label">
                Age
              </label>

              <input
                className="input"
                type="number"
                required
                min="15"
                max="100"
                value={form.age}
                onChange={(e) =>
                  handleChange(
                    "age",
                    Number(e.target.value)
                  )
                }
              />
            </div>

          </div>

          {/* Department / Semester */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Department
              </label>

              <input
                className="input"
                required
                minLength={2}
                maxLength={100}
                value={form.department}
                onChange={(e) =>
                  handleChange(
                    "department",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                Semester
              </label>

              <input
                className="input"
                type="number"
                required
                min="1"
                max="8"
                value={form.semester}
                onChange={(e) =>
                  handleChange(
                    "semester",
                    Number(e.target.value)
                  )
                }
              />
            </div>

          </div>

          {/* CGPA / Attendance */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                CGPA
              </label>

              <input
                className="input"
                type="number"
                step="0.1"
                min="0"
                max="4"
                required
                value={form.cgpa}
                onChange={(e) =>
                  handleChange(
                    "cgpa",
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                Attendance %
              </label>

              <input
                className="input"
                type="number"
                min="0"
                max="100"
                required
                value={form.attendance}
                onChange={(e) =>
                  handleChange(
                    "attendance",
                    Number(e.target.value)
                  )
                }
              />
            </div>

          </div>

          {/* Teacher ID */}
          <div>
            <label className="label">
              Teacher ID
            </label>

            <input
              className="input"
              pattern="[A-Za-z0-9_-]{3,20}"
              maxLength={20}
              value={form.teacher_id}
              onChange={(e) =>
                handleChange(
                  "teacher_id",
                  e.target.value
                )
              }
            />

            <p className="text-xs text-slate-400 mt-1">
              Optional. Teacher must already exist.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="label">
              Phone
            </label>

            <input
              className="input"
              pattern="03\d{9}"
              maxLength={11}
              value={form.phone}
              onChange={(e) =>
                handleChange(
                  "phone",
                  e.target.value
                )
              }
            />
          </div>

          {/* Address */}
          <div>
            <label className="label">
              Address
            </label>

            <textarea
              className="input"
              rows={3}
              minLength={3}
              maxLength={250}
              value={form.address}
              onChange={(e) =>
                handleChange(
                  "address",
                  e.target.value
                )
              }
            />
          </div>

          {/* Status */}
          <div>
            <label className="label">
              Status
            </label>

            <select
              className="input"
              value={form.status}
              onChange={(e) =>
                handleChange(
                  "status",
                  e.target.value
                )
              }
            >
              <option value="Active">
                Active
              </option>

              <option value="Inactive">
                Inactive
              </option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={close}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {modal === "add"
                ? "Add Student"
                : "Save Changes"}
            </button>

          </div>

        </form>
      </Modal>

      {/* Delete Student */}
      <Modal
        open={modal === "delete"}
        onClose={close}
        title="Delete Student"
        width="max-w-sm"
      >
        <p className="text-sm text-slate-500 mb-5">
          Remove{" "}
          <strong>
            {active?.first_name} {active?.last_name}
          </strong>{" "}
          from student records?

          <br />

          This action cannot be undone.
        </p>

        <div className="flex gap-3">

          <button
            onClick={close}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>

          <button
            onClick={handleDelete}
            className="btn-danger flex-1"
          >
            Delete
          </button>

        </div>
      </Modal>

    </div>
  );
}
