export default function ProtectedRoute({ requiredUserType }) {
    const {user, loading} = useContext(AuthContext);
    if(loading) return <div>Loading...</div>
    if(!user) return <Navigate to="/login" replace />;

    if(requiredUserType && user.userType !== requiredUserType){
        return <div>Access Denied</div>
    }
    return <Outlet />;
}