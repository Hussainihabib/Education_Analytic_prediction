import { useEffect, useState } from "react";

import {

  getMyNotifications,

  markNotificationRead,

  deleteNotification

} from "../../api/api";

import { useData } from "../../context/DataContext.jsx";

export default function UserNotifications() {

  const { showToast } = useData();

  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);

  // ==========================================
  // Load Notifications
  // ==========================================

  const loadNotifications = async () => {

    try {

      setLoading(true);

      const data = await getMyNotifications();

      setNotifications(data || []);

    }

    catch (err) {

      console.error(err);

      showToast("Failed to load notifications.");

    }

    finally {

      setLoading(false);

    }

  };

  useEffect(() => {

    loadNotifications();

  }, []);

  // ==========================================
  // Mark Read
  // ==========================================

  const handleRead = async (notificationId) => {

    try {

      await markNotificationRead(notificationId);

      showToast("Notification marked as read.");

      loadNotifications();

    }

    catch (err) {

      console.error(err);

      showToast("Unable to mark notification.");

    }

  };

  return (

    <div className="space-y-6">

      <div className="card p-6">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold">

            My Notifications

          </h2>

          <span className="text-sm text-slate-500">

            {notifications.length} Notifications

          </span>

        </div>

      </div>


            {

        loading

        ?

        (

          <div className="card p-10 text-center text-slate-400">

            Loading notifications...

          </div>

        )

        :

        notifications.length === 0

        ?

        (

          <div className="card p-10 text-center text-slate-400">

            No Notifications Found

          </div>

        )

        :

        (

          <div className="space-y-4">

            {

              notifications.map((item) => (

                <div

                  key={item.notification_id}

                  className={`border rounded-xl p-5 transition

                  ${

                    item.is_read

                    ?

                    "border-slate-200 dark:border-navy-700"

                    :

                    "border-blue-400 bg-blue-50/40 dark:bg-navy-700/40"

                  }`}

                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="flex-1">

                      <div className="flex items-center gap-2 flex-wrap">

                        <h3 className="font-semibold text-base">

                          {item.title}

                        </h3>

                        <span

                          className={`px-2 py-1 rounded-full text-xs

                          ${

                            item.is_read

                            ?

                            "bg-green-100 text-green-700"

                            :

                            "bg-yellow-100 text-yellow-700"

                          }`}

                        >

                          {

                            item.is_read

                            ?

                            "Read"

                            :

                            "Unread"

                          }

                        </span>

                      </div>

                      <p className="text-slate-500 mt-2">

                        {item.message}

                      </p>

                      <div className="mt-3 text-xs text-slate-400">

                        {

                          new Date(

                            item.created_at

                          ).toLocaleString()

                        }

                      </div>

                    </div>

                    <div className="flex flex-col gap-2">


                                              {

                        !item.is_read && (

                          <button

                            onClick={() =>

                              handleRead(

                                item.notification_id

                              )

                            }

                            className="btn-primary"

                          >

                            Mark Read

                          </button>

                        )

                      }

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

                              "Notification deleted."

                            );

                            loadNotifications();

                          }

                          catch (err) {

                            console.error(err);

                            showToast(

                              "Unable to delete notification."

                            );

                          }

                        }}

                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition"

                      >

                        Delete

                      </button>

                    </div>

                  </div>

                </div>

              ))

            }

          </div>

        )

      }

    </div>

  );

}