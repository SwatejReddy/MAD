const Home = {
    mounted() {
        if (localStorage.getItem('role') === 'professional') {
            this.$router.push('/professional-dashboard');
        } else if (localStorage.getItem('role') === 'customer') {
            this.$router.push('/customer-dashboard');
        } else if (localStorage.getItem('role') === 'admin') {
            this.$router.push('/admin-dashboard');
        } else {
            this.$router.push('/login');
        }
    }
}
import AdminDashboard from "../pages/AdminDashboard.js";
import AdminLoginPage from "../pages/AdminLoginPage.js";
import AllServices from "../pages/AllServices.js";
import CustomerDashboard from "../pages/CustomerDashboard.js";
import CustomerRegister from "../pages/CustomerRegister.js";
import CustomerRequests from "../pages/CustomerRequests.js";
import LoginPage from "../pages/LoginPage.js";
import NotApproved from "../pages/NotApproved.js";
import ProfessionalRegisterPage from "../pages/ProfessionalRegisterPage.js";
import RequestsPage from "../pages/RequestsPage.js";
import SPDashboard from "../pages/SPDashboard.js";
import SPSearchPage from "../pages/SPSearchPage.js";
import SPSearchResults from "../pages/SPSearchResults.js";
import UserSearchPage from "../pages/UserSearchPage.js";
import UserSearchResultsPage from "../pages/UserSearchResultsPage.js";


const routes = [
    { path: '/', component: Home },
    { path: '/professional-dashboard', component: SPDashboard },
    { path: '/customer-dashboard', component: CustomerDashboard },
    { path: '/admin-dashboard', component: AdminDashboard },
    { path: '/all-services', component: AllServices },
    { path: '/professional-requests', component: RequestsPage },
    { path: '/search-professionals', component: SPSearchPage },
    { path: '/sp-search-results', component: SPSearchResults },
    { path: '/customer-requests', component: CustomerRequests },
    { path: '/login', component: LoginPage },
    { path: '/admin-login', component: AdminLoginPage },
    { path: '/professional-register', component: ProfessionalRegisterPage },
    { path: '/customer-register', component: CustomerRegister },
    { path: '/not-approved', component: NotApproved },
    { path: '/user-search', component: UserSearchPage },
    { path: '/user-search-results', component: UserSearchResultsPage },
]

const router = new VueRouter({
    routes
})

export default router;