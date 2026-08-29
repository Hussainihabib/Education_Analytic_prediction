import { useState } from 'react'
import Modal from '../../components/Modal.jsx'
import { useData } from '../../context/DataContext.jsx'

const emptyForm = { id: '', name: '', head: '', courses: 0, students: 0 }

export default function Departments() {
  const { departmentList, addDepartment, updateDepartment, deleteDepartment } = useData()
  const [modal, setModal] = useState(null)
  const [active, setActive] = useState(null)
  const [form, setForm] = useState(emptyForm)

  const openAdd = () => { setForm(emptyForm); setModal('add') }
  const openEdit = (row) => { setActive(row); setForm(row); setModal('edit') }
  const openDelete = (row) => { setActive(row); setModal('delete') }
  const close = () => { setModal(null); setActive(null) }

  const submit = (e) => {
    e.preventDefault()
    const payload = { ...form, courses: Number(form.courses), students: Number(form.students) }
    if (modal === 'add') addDepartment(payload)
    if (modal === 'edit') updateDepartment(active.id, payload)
    close()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">{departmentList.length} departments configured.</p>
        <button onClick={openAdd} className="btn-primary">+ Add Department</button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departmentList.map((d) => (
          <div key={d.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="eyebrow">{d.id}</div>
                <h3 className="font-semibold text-lg mt-1">{d.name}</h3>
              </div>
              <span className="w-9 h-9 rounded-lg bg-navy-900 text-cream-100 flex items-center justify-center text-sm font-serif">{d.id.slice(0, 2)}</span>
            </div>
            <p className="text-sm text-slate-500 mt-3">Head of Department</p>
            <p className="text-sm font-medium">{d.head}</p>
            <div className="flex items-center gap-4 mt-4 text-sm">
              <div><span className="font-semibold">{d.courses}</span> <span className="text-slate-400">courses</span></div>
              <div><span className="font-semibold">{d.students}</span> <span className="text-slate-400">students</span></div>
            </div>
            <div className="flex gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-navy-700">
              <button onClick={() => openEdit(d)} className="text-xs font-medium text-navy-900 dark:text-cream-100 hover:underline">Edit</button>
              <button onClick={() => openDelete(d)} className="text-xs font-medium text-red-500 hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={modal === 'add' || modal === 'edit'} onClose={close} title={modal === 'add' ? 'Add Department' : 'Edit Department'}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Department code</label>
              <input className="input" required disabled={modal === 'edit'} value={form.id} onChange={(e) => setForm({ ...form, id: e.target.value.toUpperCase() })} />
            </div>
            <div>
              <label className="label">Courses offered</label>
              <input className="input" type="number" min="0" value={form.courses} onChange={(e) => setForm({ ...form, courses: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label">Department name</label>
            <input className="input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Head of department</label>
            <input className="input" required value={form.head} onChange={(e) => setForm({ ...form, head: e.target.value })} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={close} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">{modal === 'add' ? 'Add Department' : 'Save Changes'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'delete'} onClose={close} title="Delete Department" width="max-w-sm">
        <p className="text-sm text-slate-500 mb-5">Remove <strong>{active?.name}</strong>? Courses assigned to it will be unaffected in this demo.</p>
        <div className="flex gap-3">
          <button onClick={close} className="btn-secondary flex-1">Cancel</button>
          <button onClick={() => { deleteDepartment(active.id); close() }} className="btn-danger flex-1">Delete</button>
        </div>
      </Modal>
    </div>
  )
}
