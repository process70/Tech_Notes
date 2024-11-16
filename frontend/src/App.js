import "./App.css";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Public from "./components/Public";
import Login from "./features/auth/Login";
import DashLayout from "./components/DashLayout";
import Welcome from "./features/auth/Welcome";
import UsersList from "./features/users/UsersList";
import NotesList from "./features/notes/NotesList";
import CreateUser from "./features/users/CreateUser";
import EditUser from "./features/users/EditUser";
import CreateNote from "./features/notes/CreateNote";
import EditNote from "./features/notes/EditNote";
import Prefetch from "./config/Prefetch";
import PersistLogin from "./features/auth/PersistLogin";
import RequireAuth from "./features/users/RequireAuth";
import { roles } from "./config/roles";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        {/* these are the layout's children */}
        <Route index element={<Public />} />
        <Route path="login" element={<Login />} />
        <Route element={<PersistLogin />}>
          <Route element={<RequireAuth allowedRoles={Object.values(roles)} />}>
            <Route element={<Prefetch />}>
              <Route path="dash" element={<DashLayout />}>
                <Route index element={<Welcome />} />
                <Route element={<RequireAuth allowedRoles={[roles.ADMIN, roles.MANAGER]} />}>
                  <Route path="users">
                    <Route index element={<UsersList />} />
                    <Route path="create" element={<CreateUser />} />
                    <Route path=":id" element={<EditUser />} />
                  </Route>
                </Route>

                <Route path="notes">
                  <Route index element={<NotesList />} />
                  <Route path="create" element={<CreateNote />} />
                  <Route path=":id" element={<EditNote />} />
                </Route>
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
