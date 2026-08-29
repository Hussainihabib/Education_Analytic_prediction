// import { useState } from 'react'
// import DataTable from '../../components/DataTable.jsx'
// import Modal from '../../components/Modal.jsx'
// import { useData } from '../../context/DataContext.jsx'
// import { departments } from '../../data/mockData.js'

// const emptyForm = { code: '', name: '', dept: 'CS', teacher: '', credits: 3, enrolled: 0 }

// export default function Courses() {
//   const { courseList, addCourse, updateCourse, deleteCourse, teachers } = useData()
//   const [modal, setModal] = useState(null)
//   const [active, setActive] = useState(null)
//   const [form, setForm] = useState(emptyForm)

//   const openAdd = () => { setForm(emptyForm); setModal('add') }
//   const openEdit = (row) => { setActive(row); setForm(row); setModal('edit') }
//   const openDelete = (row) => { setActive(row); setModal('delete') }
//   const close = () => { setModal(null); setActive(null) }

//   const submit = (e) => {
//     e.preventDefault()
//     const payload = { ...form, credits: Number(form.credits), enrolled: Number(form.enrolled) }
//     if (modal === 'add') addCourse(payload)
//     if (modal === 'edit') updateCourse(active.code, payload)
//     close()
//   }

//   const columns = [
//     { key: 'code', label: 'Code' },
//     { key: 'name', label: 'Course Name' },
//     { key: 'dept', label: 'Dept' },
//     { key: 'teacher', label: 'Assigned Teacher' },
//     { key: 'credits', label: 'Credits' },
//     { key: 'enrolled', label: 'Enrolled' },
//   ]

//   return (
//     <div className="space-y-5">
//       <div className="flex items-center justify-between">
//         <p className="text-sm text-slate-500">{courseList.length} courses offered across all departments.</p>
//         <button onClick={openAdd} className="btn-primary">+ Add Course</button>
//       </div>

//       <DataTable
//         columns={columns}
//         rows={courseList}
//         rowKey="code"
//         searchKeys={['code', 'name', 'teacher']}
//         filters={[{ key: 'dept', label: 'Dept', options: departments.map((d) => d.id) }]}
//         renderActions={(row) => (
//           <div className="flex justify-end gap-2">
//             <button onClick={() => openEdit(row)} className="text-xs font-medium text-navy-900 dark:text-cream-100 hover:underline">Edit</button>
//             <button onClick={() => openDelete(row)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
//           </div>
//         )}
//       />

//       <Modal open={modal === 'add' || modal === 'edit'} onClose={close} title={modal === 'add' ? 'Add Course' : 'Edit Course'}>
//         <form onSubmit={submit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="label">Course code</label>
//               <input className="input" required disabled={modal === 'edit'} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
//             </div>
//             <div>
//               <label className="label">Credits</label>
//               <input className="input" type="number" min="1" max="6" required value={form.credits} onChange={(e) => setForm({ ...form, credits: e.target.value })} />
//             </div>
//           </div>
//           <div>
//             <label className="label">Course name</label>
//             <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
//           </div>
//           <div className="grid grid-cols-2 gap-3">
//             <div>
//               <label className="label">Department</label>
//               <select className="input" value={form.dept} onChange={(e) => setForm({ ...form, dept: e.target.value })}>
//                 {departments.map((d) => <option key={d.id} value={d.id}>{d.id}</option>)}
//               </select>
//             </div>
//             <div>
//               <label className="label">Assign teacher</label>
//               <select className="input" value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
//                 <option value="">Unassigned</option>
//                 {teachers.map((t) => <option key={t.id} value={t.name}>{t.name}</option>)}
//               </select>
//             </div>
//           </div>
//           <div className="flex gap-3 pt-2">
//             <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
//             <button type="submit" className="btn-primary flex-1">{modal === 'add' ? 'Add Course' : 'Save Changes'}</button>
//           </div>
//         </form>
//       </Modal>

//       <Modal open={modal === 'delete'} onClose={close} title="Delete Course" width="max-w-sm">
//         <p className="text-sm text-slate-500 mb-5">Remove <strong>{active?.name}</strong> ({active?.code}) from the catalog?</p>
//         <div className="flex gap-3">
//           <button onClick={close} className="btn-secondary flex-1">Cancel</button>
//           <button onClick={() => { deleteCourse(active.code); close() }} className="btn-danger flex-1">Delete</button>
//         </div>
//       </Modal>
//     </div>

//   )
// }
import { apiErrorMessage } from "../../utils/validation";

import { useState, useEffect } from "react";
import DataTable from "../../components/DataTable.jsx";
import Modal from "../../components/Modal.jsx";
import { StatusBadge } from "../../components/Badges.jsx";

import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from "../../api/courseApi";

const emptyForm = {
  course_code: "",
  course_name: "",
  department: "",
  semester: 1,
  credit_hours: 3,
  teacher_name: "",
  teacher_id: "",
  course_type: "Core",
  status: "Active",
};

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modal, setModal] = useState(null);
  const [active, setActive] = useState(null);
  const [form, setForm] = useState({
    ...emptyForm,
  });

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    try {
      setError("");

      const res = await getCourses();

      setCourses(res?.courses || []);
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        Loading Courses...
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
      course_code: row.course_code || "",
      course_name: row.course_name || "",
      department: row.department || "",
      semester: row.semester ?? 1,
      credit_hours: row.credit_hours ?? 3,
      teacher_name: row.teacher_name || "",
      teacher_id: row.teacher_id || "",
      course_type: row.course_type || "Core",
      status: row.status || "Active",
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
        await createCourse(form);
      }

      if (modal === "edit") {
        await updateCourse(
          active.course_code,
          form
        );
      }

      await loadCourses();
      close();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!active?.course_code) return;

    try {
      setError("");

      await deleteCourse(
        active.course_code
      );

      await loadCourses();

      close();
    } catch (err) {
      setError(apiErrorMessage(err));
    }
  };

  const columns = [
    {
      key: "course_code",
      label: "Course Code",
    },

    {
      key: "course_name",
      label: "Course Name",
    },

    {
      key: "department",
      label: "Department",
    },

    {
      key: "teacher_name",
      label: "Teacher",
    },

    {
      key: "semester",
      label: "Semester",
    },

    {
      key: "credit_hours",
      label: "Credits",
    },

    {
      key: "course_type",
      label: "Type",
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
            {courses.length} courses available.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="btn-primary"
        >
          + Add Course
        </button>

      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Course Table */}
      <DataTable
        columns={columns}
        rows={courses}
        searchKeys={[
          "course_code",
          "course_name",
          "department",
          "teacher_name",
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

      {/* Add / Edit Course */}
      <Modal
        open={
          modal === "add" ||
          modal === "edit"
        }
        onClose={close}
        title={
          modal === "add"
            ? "Add Course"
            : "Edit Course"
        }
      >
        <form
          onSubmit={submit}
          className="space-y-4"
        >

          {/* Course Code / Name */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Course Code
              </label>

              <input
                className="input"
                required
                disabled={modal === "edit"}
                pattern="[A-Za-z0-9_-]{3,20}"
                minLength={3}
                maxLength={20}
                value={form.course_code}
                onChange={(e) =>
                  handleChange(
                    "course_code",
                    e.target.value
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                Course Name
              </label>

              <input
                className="input"
                required
                minLength={2}
                maxLength={120}
                value={form.course_name}
                onChange={(e) =>
                  handleChange(
                    "course_name",
                    e.target.value
                  )
                }
              />
            </div>

          </div>

          {/* Department / Teacher Name */}
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
                Teacher Name
              </label>

              <input
                className="input"
                required
                minLength={2}
                maxLength={100}
                value={form.teacher_name}
                onChange={(e) =>
                  handleChange(
                    "teacher_name",
                    e.target.value
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
              minLength={3}
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
              Optional.
            </p>
          </div>

          {/* Semester / Credits */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Semester
              </label>

              <input
                type="number"
                min="1"
                max="8"
                required
                className="input"
                value={form.semester}
                onChange={(e) =>
                  handleChange(
                    "semester",
                    Number(e.target.value)
                  )
                }
              />
            </div>

            <div>
              <label className="label">
                Credit Hours
              </label>

              <input
                type="number"
                min="1"
                max="6"
                required
                className="input"
                value={form.credit_hours}
                onChange={(e) =>
                  handleChange(
                    "credit_hours",
                    Number(e.target.value)
                  )
                }
              />
            </div>

          </div>

          {/* Type / Status */}
          <div className="grid grid-cols-2 gap-3">

            <div>
              <label className="label">
                Course Type
              </label>

              <select
                className="input"
                value={form.course_type}
                onChange={(e) =>
                  handleChange(
                    "course_type",
                    e.target.value
                  )
                }
              >
                <option value="Core">
                  Core
                </option>

                <option value="Elective">
                  Elective
                </option>
              </select>
            </div>

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
                ? "Add Course"
                : "Save Changes"}
            </button>

          </div>

        </form>
      </Modal>

      {/* Delete Course */}
      <Modal
        open={modal === "delete"}
        onClose={close}
        title="Delete Course"
        width="max-w-sm"
      >
        <p className="text-sm text-slate-500 mb-5">

          Remove{" "}

          <strong>
            {active?.course_name}
          </strong>

          {" "}(
          <strong>
            {active?.course_code}
          </strong>
          )

          {" "}from course records?

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
            className="btn-danger flex-1"
            onClick={handleDelete}
          >
            Delete
          </button>

        </div>
      </Modal>

    </div>
  );
}
