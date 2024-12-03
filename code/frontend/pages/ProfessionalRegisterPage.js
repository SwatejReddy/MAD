export default {
    template: `
    <div style="display: flex;justify-content: center;align-items: center; margin-top: 150px;">
        <div style="margin: auto; width: 50%;border: 2px solid rgb(185, 185, 185); margin-top:20px ;background-color: white;padding: 20px;">
                <h1 style="text-align: center;color: black; font-weight: bolder;">Register as professional</h1> 
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
                    <label>Service</label>
                    <select v-model="selectedServiceId" class="form-control">
                        <option v-for="service in services" :key="service.id" :value="service.id" >
                            {{ service.name }}
                        </option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Experience (years)</label>
                    <input placeholder="experience" v-model="experience" class="form-control"/> 
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input placeholder="location" v-model="location" class="form-control"/>  
                </div>
                <button @click="submitRegister" class='btn btn-dark'> Register </button>
        </div>
    </div>
    `,
    data() {
        return {
            name: null,
            username: null,
            password: null,
            experience: null,
            location: null,
            selectedServiceId: null, // Variable to store selected service ID
            services: [] // Array to hold fetched services
        };
    },
    created() {
        this.fetchServices(); // Fetch services when the component is created
    },
    methods: {
        async fetchServices() {
            try {
                const res = await fetch(location.origin + '/services/all');
                if (res.ok) {
                    this.services = await res.json(); // Populate services array
                } else {
                    console.error('Failed to fetch services');
                }
            } catch (error) {
                console.error('Error fetching services:', error);
            }
        },
        async submitRegister() {
            if (!this.selectedServiceId) {
                alert('Please select a service');
                return;
            }
            const requestData = {
                name: this.name,
                username: this.username,
                password: this.password,
                service_id: this.selectedServiceId,
                experience_years: this.experience,
                location: this.location,
            };
            try {
                const res = await fetch(location.origin + '/professional/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(requestData),
                });
                if (res.ok) {
                    console.log('Professional registered successfully');
                } else {
                    console.error('Registration failed');
                }
            } catch (error) {
                console.error('Error during registration:', error);
            } finally {
                this.$router.push('/login');
            }
        }
    }
};
