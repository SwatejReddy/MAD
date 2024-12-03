export default {
    template: `
    <div style="display: flex;justify-content: center;align-items: center; margin-top: 150px;">
        <div style="margin: auto; width: 50%;border: 2px solid rgb(185, 185, 185); margin-top:20px ;background-color: white;padding: 20px;">
                <h1 style="text-align: center;color: black; font-weight: bolder;">Register as Customer</h1> 
                

                <div class="form-group">
                    <label>Name</label>
                    <input placeholder="name" v-model="name" class="form-control"/>  
                </div>
                <div class="form-group">
                    <label>Username</label>
                    <input placeholder="username" v-model="username" class="form-control"/>  
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password" placeholder="password" v-model="password" class="form-control"/>  
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <textarea placeholder="address" v-model="address" class="form-control"></textarea>  
                </div>
                <div class="form-group">
                    <label>Contact Number</label>
                    <input type="tel" placeholder="contact number" v-model="contactNumber" class="form-control"/>  
                </div>
                    <button @click="submitRegister" class='btn btn-dark'> Register </button>
                </div>
        </div> 
    </div>
    <div>
        <h1></h1>
        
    </div>
    `,
    data() {
        return {
            name: null,
            username: null,
            password: null,
            address: null,
            contactNumber: null
        };
    },
    methods: {
        async submitRegister() {
            const requestData = {
                name: this.name,
                username: this.username,
                password: this.password,
                address: this.address,
                contact_number: this.contactNumber,
            };
            try {
                const res = await fetch(location.origin + '/customer/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData),
                });
                if (res.ok) {
                    console.log('Customer registered successfully');
                    this.$router.push('/login');
                } else {
                    const error = await res.json();
                    console.error('Registration failed:', error.message);
                }
            } catch (error) {
                console.error('Error during registration:', error);
            }
        }
    }
};
