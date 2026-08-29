import { apiErrorMessage } from "../../utils/validation";
import { useEffect, useState } from "react";

import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import { StatusBadge } from "../../components/Badges.jsx";

import {
  getAttendance,
  createAttendance,
  updateAttendance,
  deleteAttendance,
} from "../../api/attendanceApi";

const emptyForm = {
  attendance_id: "",
  student_id: "",
  course_id: "",
  teacher_id: "",
  attendance_date: "",
  status: "Present",
  remarks: "",
};

export default function Attendance() {

  const [attendance, setAttendance] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);

  const [active, setActive] = useState(null);

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {

    loadAttendance();

  }, []);

  async function loadAttendance() {

    try {

      const res = await getAttendance();

      setAttendance(res.attendance || []);

    } catch (err) {

      setError(apiErrorMessage(err));

    } finally {

      setLoading(false);

    }

  }

  function openAdd() {

    setForm(emptyForm);

    setModal("add");

  }

  function openEdit(row) {

    setActive(row);

    setForm({

      attendance_id: row.attendance_id,

      student_id: row.student_id,

      course_id: row.course_id,

      teacher_id: row.teacher_id,

      attendance_date: row.attendance_date
        ? row.attendance_date.substring(0,10)
        : "",

      status: row.status,

      remarks: row.remarks || ""

    });

    setModal("edit");

  }

  function openDelete(row) {

    setActive(row);

    setModal("delete");

  }

  function closeModal() {

    setModal(null);

    setActive(null);

  }

  async function submit(e) {

    e.preventDefault();

    try {

      if (modal === "add") {

        await createAttendance(form);

      } else {

        await updateAttendance(

          active.attendance_id,

          form

        );

      }

      closeModal();

      loadAttendance();

    } catch (err) {

      setError(apiErrorMessage(err));

    }

  }

  async function removeAttendance() {

    try {

      await deleteAttendance(

        active.attendance_id

      );

      closeModal();

      loadAttendance();

    } catch (err) {

      setError(apiErrorMessage(err));

    }

  }

  const columns = [

    {

      key: "attendance_id",

      label: "Attendance ID",

    },

    {

      key: "student_id",

      label: "Student",

    },

    {

      key: "course_id",

      label: "Course",

    },

    {

      key: "teacher_id",

      label: "Teacher",

    },

    {

      key: "attendance_date",

      label: "Date",

      render: (row) =>

        row.attendance_date

          ? new Date(

              row.attendance_date

            ).toLocaleDateString()

          : "-",

    },

    {

      key: "status",

      label: "Status",

      render: (row) => (

        <StatusBadge

          value={row.status}

        />

      ),

    },

  ];

  if (loading) {

    return (

      <div className="text-center py-10">

        Loading Attendance...

      </div>

    );

  }
  return (

    <div className="space-y-5">
      {error && <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-3 py-2 text-sm">{error}</div>}

      <div className="flex items-center justify-between">

        <h1 className="text-2xl font-bold">

          Attendance

        </h1>

        <button
          onClick={openAdd}
          className="btn-primary"
        >
          + Add Attendance
        </button>

      </div>

      <DataTable
        columns={columns}
        rows={attendance}
        rowKey="attendance_id"
        searchKeys={[
          "attendance_id",
          "student_id",
          "course_id",
          "teacher_id",
        ]}
        filters={[
          {
            key: "status",
            label: "Status",
            options: [
              "Present",
              "Absent",
              "Late",
            ],
          },
        ]}
        renderActions={(row) => (
          <div className="flex justify-end gap-2">

            <button
              onClick={() => openEdit(row)}
              className="text-xs font-medium text-navy-900 hover:underline"
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

      <Modal
        open={modal === "add" || modal === "edit"}
        onClose={closeModal}
        title={
          modal === "add"
            ? "Add Attendance"
            : "Edit Attendance"
        }
      >

        <form
          onSubmit={submit}
          className="space-y-4"
        >

          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="label">

                Attendance ID

              </label>

              <input
                className="input"
                required
                disabled={modal === "edit"}
                value={form.attendance_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendance_id:
                      e.target.value,
                  })
                }
              />

            </div>

            <div>

              <label className="label">

                Student ID

              </label>

              <input
                className="input"
                required
                value={form.student_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    student_id:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="label">

                Course ID

              </label>

              <input
                className="input"
                required
                value={form.course_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    course_id:
                      e.target.value,
                  })
                }
              />

            </div>

            <div>

              <label className="label">

                Teacher ID

              </label>

              <input
                className="input"
                required
                value={form.teacher_id}
                onChange={(e) =>
                  setForm({
                    ...form,
                    teacher_id:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>

          <div className="grid grid-cols-2 gap-3">

            <div>

              <label className="label">

                Date

              </label>

              <input
                type="date"
                className="input"
                required
                value={form.attendance_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    attendance_date:
                      e.target.value,
                  })
                }
              />

            </div>

            <div>

              <label className="label">

                Status

              </label>

              <select
                className="input"
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status:
                      e.target.value,
                  })
                }
              >
                <option>
                  Present
                </option>

                <option>
                  Absent
                </option>

                <option>
                  Late
                </option>

              </select>

            </div>

          </div>

          <div>

            <label className="label">

              Remarks

            </label>

            <textarea
              className="input"
              value={form.remarks}
              onChange={(e) =>
                setForm({
                  ...form,
                  remarks:
                    e.target.value,
                })
              }
            />

          </div>

          <div className="flex gap-3 pt-2">

            <button
              type="button"
              onClick={closeModal}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn-primary flex-1"
            >
              {modal === "add"
                ? "Add Attendance"
                : "Save Changes"}
            </button>

          </div>

        </form>

      </Modal>

      <Modal
        open={modal === "delete"}
        onClose={closeModal}
        title="Delete Attendance"
        width="max-w-sm"
      >

        <p className="text-sm text-slate-500 mb-5">

          Delete Attendance

          <strong>

            {" "}
            {active?.attendance_id}

          </strong>

          ?

        </p>

        <div className="flex gap-3">

          <button
            onClick={closeModal}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>

          <button
            onClick={removeAttendance}
            className="btn-danger flex-1"
          >
            Delete
          </button>

        </div>

      </Modal>

    </div>

  );

}
