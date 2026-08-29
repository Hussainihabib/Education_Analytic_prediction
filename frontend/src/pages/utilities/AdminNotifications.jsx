import { useEffect, useState } from "react";

import {
  createNotification,
  getAllNotifications,
  generateNotifications,
  deleteNotification
} from "../../api/api";

import { useData } from "../../context/DataContext.jsx";

export default function AdminNotifications() {

  const { showToast } = useData();

  const [loading, setLoading] = useState(false);

  const [generating, setGenerating] = useState(false);

  const [notifications, setNotifications] = useState([]);

  const [form, setForm] = useState({

    title: "",

    message: "",

    receiver_role: "Student",

    receiver_email: ""

  });

  // ==========================================
  // Load Notifications
  // ==========================================

  const loadNotifications = async () => {

    try {

      setLoading(true);

      const data = await getAllNotifications();

      setNotifications(data || []);

    } catch (error) {

      console.error(error);

      showToast("Unable to load notifications.");

    } finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadNotifications();

  }, []);

  // ==========================================
  // Create Notification
  // ==========================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await createNotification(form);

      showToast("Notification created successfully.");

      setForm({

        title: "",

        message: "",

        receiver_role: "Student",

        receiver_email: ""

      });

      loadNotifications();

    } catch (err) {

      console.error(err);

      showToast("Failed to create notification.");

    }

  };

  return (

    <div className="space-y-6">

      <div className="card p-6">

        <h2 className="text-xl font-semibold mb-5">

          Create Notification

        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <div>

            <label className="label">

              Title

            </label>

            <input
              className="input"
              required
              value={form.title}
              onChange={(e)=>

                setForm({

                  ...form,

                  title:e.target.value

                })

              }
            />

          </div>

          <div>

            <label className="label">

              Message

            </label>

            <textarea
              rows="4"
              className="input"
              required
              value={form.message}
              onChange={(e)=>

                setForm({

                  ...form,

                  message:e.target.value

                })

              }
            />

          </div>

          <div className="grid md:grid-cols-2 gap-4">

            <div>

              <label className="label">

                Receiver Role

              </label>

              <select
                className="input"
                value={form.receiver_role}
                onChange={(e)=>

                  setForm({

                    ...form,

                    receiver_role:e.target.value

                  })

                }
              >

                <option value="Student">

                  Student

                </option>

                <option value="Teacher">

                  Teacher

                </option>

              </select>

            </div>

            <div>

              <label className="label">

                Receiver Email

              </label>

              <input
                type="email"
                required
                className="input"
                placeholder="student@gmail.com"
                value={form.receiver_email}
                onChange={(e)=>

                  setForm({

                    ...form,

                    receiver_email:e.target.value

                  })

                }
              />

            </div>

          </div>

          <button

            type="submit"

            className="btn-primary"

          >

            Create Notification

          </button>

        </form>

      </div>



            {/* ========================================== */}
      {/* Generate Notifications */}
      {/* ========================================== */}

      <div className="card p-6">

        <div className="flex items-center justify-between flex-wrap gap-3">

          <div>

            <h2 className="text-xl font-semibold">

              Automatic Notifications

            </h2>

            <p className="text-sm text-slate-500 mt-1">

              Generate notifications automatically for low attendance,
              low CGPA and failed courses.

            </p>

          </div>

          <button

            onClick={async () => {

              try {

                setGenerating(true);

                const res = await generateNotifications();

                showToast(res.message);

                loadNotifications();

              }

              catch (err) {

                console.error(err);

                showToast("Failed to generate notifications.");

              }

              finally {

                setGenerating(false);

              }

            }}

            disabled={generating}

            className="btn-primary"

          >

            {

              generating

              ?

              "Generating..."

              :

              "Generate Notifications"

            }

          </button>

        </div>

      </div>

      {/* ========================================== */}
      {/* All Notifications */}
      {/* ========================================== */}

      <div className="card p-6">

        <div className="flex items-center justify-between mb-5">

          <h2 className="text-xl font-semibold">

            All Notifications

          </h2>

          <span className="text-sm text-slate-500">

            Total :

            {" "}

            {notifications.length}

          </span>

        </div>

        {

          loading

          ?

          (

            <div className="text-center py-12 text-slate-400">

              Loading Notifications...

            </div>

          )

          :

          notifications.length === 0

          ?

          (

            <div className="text-center py-12 text-slate-400">

              No Notifications Found

            </div>

          )

          :

          (

            <div className="space-y-4">

              {

                notifications.map((item)=>(

                  <div

                    key={item.notification_id}

                    className="border border-slate-200 dark:border-navy-700 rounded-xl p-4 flex justify-between gap-4"

                  >

                    <div className="flex-1">

                      <div className="flex items-center gap-2 flex-wrap">

                        <h3 className="font-semibold">

                          {item.title}

                        </h3>

                        <span className="px-2 py-1 rounded-full text-xs bg-sky-100 text-sky-700">

                          {item.receiver_role}

                        </span>

                      </div>

                      <p className="text-sm text-slate-500 mt-2">

                        {item.message}

                      </p>

                      <div className="mt-3 text-xs text-slate-400 space-y-1">

                        <div>

                          Email :

                          {" "}

                          {item.receiver_email}

                        </div>

                        <div>

                          Status :

                          {

                            item.is_read

                            ?

                            "Read"

                            :

                            "Unread"

                          }

                        </div>

                        <div>

                          {

                            new Date(item.created_at)

                            .toLocaleString()

                          }

                        </div>

                      </div>

                    </div>

                    <div className="flex items-center">




                                              <button

                        onClick={async () => {

                          const ok = window.confirm(

                            "Delete this notification?"

                          );

                          if (!ok) return;

                          try {

                            await deleteNotification(

                              item.notification_id

                            );

                            showToast(

                              "Notification deleted successfully."

                            );

                            loadNotifications();

                          }

                          catch (err) {

                            console.error(err);

                            showToast(

                              "Failed to delete notification."

                            );

                          }

                        }}

                        className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition"

                      >

                        Delete

                      </button>

                    </div>

                  </div>

                ))

              }

            </div>

          )

        }

      </div>

    </div>

  );

}