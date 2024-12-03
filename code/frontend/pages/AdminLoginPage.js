export default {
    template: `

    <div style="display: flex;justify-content: center;align-items: center; margin-top: 150px;">
    <div style="margin: auto; width: 50%;border: 2px solid rgb(185, 185, 185); margin-top:20px ;background-color: white;padding:100px 20px 100px 20px;">
                <h1 style="text-align: center;color: black; font-weight: bolder;">Admin Login</h1> 
                <div style="display: flex; justify-content: space-around ; margin-top: 50px; flex-direction: column; gap: 10px ">
                    <input style="margin: 0px 200px 0px 200px" placeholder="username"  v-model="username"/>  
                    <input style="margin: 0px 200px 0px 200px" placeholder="password"  v-model="password"/>  
                    <button style="margin: 0px 200px 0px 200px" class='btn btn-dark' @click="submitLogin"> Login </button>
                </div>
        </div> 
    </div>
    `,
    data() {
        return {
            username: null,
            password: null,
        }
    },
    methods: {
        async submitLogin() {
            const res = await fetch(location.origin + '/admin/login',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 'username': this.username, 'password': this.password })
                })
            if (res.ok) {
                console.log('we are logged in')
                const data = await res.json()
                localStorage.setItem("user", data.username)
                localStorage.setItem("token", data.token)
                localStorage.setItem("id", data.id)
                localStorage.setItem("role", data.role)
                console.log(data)
                // push to the dashboard
                if (data.role === 'professional') {
                    this.$router.push('/professional-dashboard')
                }
                if (data.role === 'customer') {
                    this.$router.push('/customer-dashboard')
                }
                else {
                    this.$router.push('/admin-dashboard')
                }
            }
        }
    }
}