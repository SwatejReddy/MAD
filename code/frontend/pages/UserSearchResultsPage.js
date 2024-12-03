export default {
    template: `
    <div style="display: flex;justify-content: center;align-items: center">
        <div style="margin: auto; width: 100%; margin-top:20px ;background-color: white;padding:100px 20px 100px 20px;">
                <h1 style="text-align: center;color: black; font-weight: bolder;">Search Results</h1> 
                <div style="display: flex; justify-content: space-around ; margin-top: 50px; flex-direction: column; gap: 10px ">
                <div style="display: flex; justify-content: space-around; margin-top: 50px; flex-direction: column; gap: 10px">

                <!-- For Customer Type -->
                <div v-if="users.length > 0 && userType == 'customer'">
                    <div v-for="user in users" :key="user.id" style="border: 2px solid rgb(185, 185, 185); border-radius: 10px; margin: 10px; padding: 30px;">
                        <p>ID: {{ user.id }}</p>
                        <p>Name: {{ user.name }}</p>
                        <p>Address: {{ user.address }}</p>
                        <p>Contact Number: {{ user.contact_number }}</p>
                        <p>Approved: {{ user.approved }}</p>
                        <button v-if="user.approved" @click="blockUnblockUser(user)" class="btn btn-danger">Block</button>
                        <button v-else @click="blockUnblockUser(user)" class="btn btn-success">Approve</button>
                    </div>
                </div>
            
                <!-- For Professional Type -->
                <div v-if="users.length > 0 && userType == 'professional'">
                    <div v-for="user in users" :key="user.id" style="border: 2px solid rgb(185, 185, 185); border-radius: 10px; margin: 10px; padding: 30px;">
                        <p>ID: {{ user.id }}</p>
                        <p>Name: {{ user.name }}</p>
                        <p>Location: {{ user.location }}</p>
                        <p>Experience (Years): {{ user.experience_years }}</p>
                        <p>Service ID: {{ user.service_id }}</p>
                        <p>Approved: {{ user.approved }}</p>
                        <button v-if="user.approved" @click="blockUnblockUser(user)" class="btn btn-danger">Block</button>
                        <button v-else @click="blockUnblockUser(user)" class="btn btn-success">Approve</button>
                    </div>
                </div>
            
                <!-- No Users Found -->
                <div v-else>
                    <p>No users found for the selected type.</p>
                </div>
            </div>
            
                    </div>
                    <button @click="goBack" class="btn btn-secondary">Go Back</button>
                    </div>
                
                <div v-else>
                    <p style="text-align: center;color: gray; font-style: italic">No users found <span style="color: black ; font-size: 30px">:(</span></p>
                    <button @click="goBack" class="btn btn-secondary ">Go Back</button>
                </div>
                </div>
        </div> 
    </div>
    `,

    data() {
        return {
            users: [],
            userType: '',
        }
    },

    mounted() {
        if (localStorage.getItem('customers')) {
            this.users = JSON.parse(localStorage.getItem('customers'));
            this.userType = 'customer'
        }
        else if (localStorage.getItem('professionals')) {
            this.users = JSON.parse(localStorage.getItem('professionals'));
            this.userType = 'professional'
        }
        else {
            this.users = [];
        }
    },

    methods: {
        goBack() {
            this.$router.go(-1);
        },

        async blockUnblockUser(user) {
            const userId = user.id;
            let url = '';
            let method = 'POST';

            // Determine which API to call based on user type
            if (this.userType === 'professional') {
                url = `${location.origin}/admin/service-professional/block-or-approve/${userId}`;
            } else if (this.userType === 'customer') {
                url = `${location.origin}/admin/customer/block-or-approve/${userId}`;
            }

            try {
                // Call the API to block or approve the user
                const response = await fetch(url, {
                    method: method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token') // Assuming auth token is stored in localStorage
                    }
                });

                const data = await response.json();

                if (response.ok) {
                    // Update the user's status based on the response
                    user.approved = !user.approved;
                    alert(data.message); // Show success message
                } else {
                    alert(data.message); // Show error message
                }
            } catch (error) {
                console.error('Error while blocking or approving user:', error);
                alert('Something went wrong. Please try again.');
            }
        },
    }
}
