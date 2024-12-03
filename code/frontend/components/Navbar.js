export default {
    template: `
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="#">HomeService</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav mr-auto">
                <li class="nav-item">
                    <router-link v-if='!role' to='/login' class="nav-link">Login</router-link>
                </li>
                <li class="nav-item">
                    <router-link v-if='!role' to='/admin-login' class="nav-link">Admin login</router-link>
                </li>
                <li class="nav-item">
                    <router-link v-if='!role' to='/professional-register' class="nav-link">Professional Register</router-link>
                </li>
                <li class="nav-item">
                    <router-link v-if='!role' to='/customer-register' class="nav-link">Customer Register</router-link>
                </li>
                <li class="nav-item">
                <router-link v-if='role === "professional"' to='/professional-dashboard' class="nav-link">Professional Dashboard</router-link>
                </li>
                <li class="nav-item">
                <router-link v-if='role === "customer"' to='/customer-dashboard' class="nav-link">Customer Dashboard</router-link>
                </li>
                <li class="nav-item">
                <router-link v-if='role === "admin"' to='/admin-dashboard' class="nav-link">Admin Dashboard</router-link>
                </li>
                <li class="nav-item">
                    <div class="d-flex">
                        <button v-if='role' @click="logout" class="btn btn-secondary">Logout</button>
                    </div>
                </li>
            </ul>
        </div>
    </nav>
    <div>
    `,
    data() {
        return {
            role: null
        }
    },
    async mounted() {
        this.role = localStorage.getItem('role');
    },
    methods: {
        logout() {
            localStorage.clear();
            this.$router.push('/login');
        }
    }
}