export default {
    template: `
    <div style="display: flex;justify-content: center;align-items: center">
        <div style="margin: auto; width: 100%; margin-top:20px ;background-color: white;padding:100px 20px 100px 20px;">
                <h1 style="text-align: center;color: black; font-weight: bolder;">Search Results</h1> 
                <div style="display: flex; justify-content: space-around ; margin-top: 50px; flex-direction: column; gap: 10px ">
                    <div v-if="professionals.length > 0">
                    <div v-for="pro in professionals" :key="pro.id" style=" border: 2px solid rgb(185, 185, 185);border-radius: 10px; margin: 10px; padding: 30px;">
                        <p>Name: {{ pro.name }}</p>
                        <p>Location: {{ pro.location }}</p>
                        <p>Experience: {{ pro.experience_years }} years</p>
                        <p>Description: {{ pro.description || 'No description available' }}</p>
                        <p>Rating: {{ pro.rating || 'Not rated yet' }}</p>
                        <p>Approved: {{ pro.approved ? 'Yes' : 'No' }}</p>
                        <p>Joined: {{ pro.created_at }}</p>

                        <button @click="openRequestForm(pro.id)" class="btn btn-dark">Request Service</button>

                        <div v-if="showRequestForm && selectedProfessional.id === pro.id" style="margin-top: 5px;border: 2px solid rgb(185, 185, 185);border-radius: 10px; padding: 30px; margin: 10px">
                            <h3 style="text-align: center;color: black; font-weight: bolder;">Request Service from {{ pro.name }}</h3>
                            <form @submit.prevent="submitRequest">
                                <div class="form-group">
                                    <label for="remarks">Remarks:</label>
                                    <textarea v-model="remarks" id="remarks" placeholder="Enter any remarks" class="form-control"></textarea>
                                </div>
                                <div class="form-group">
                                    <label for="date_of_completion">Date of Completion:</label>
                                    <input type="datetime-local" v-model="date_of_completion" id="date_of_completion" class="form-control" />
                                </div>
                                <div class="form-group">
                                    <button type="submit" class="btn btn-dark">Submit Request</button>
                                </div>
                            </form>
                            <button @click="closeRequestForm" class="btn btn-secondary">Cancel</button>
                        </div>
                    </div>
                    <button @click="goBack" class="btn btn-secondary">Go Back</button>
                </div>
                
                <div v-else>
                    <p style="text-align: center;color: gray; font-style: italic">No professionals found <span style="color: black ; font-size: 30px">:(</span></p>
                    <button @click="goBack" class="btn btn-secondary ">Go Back</button>
                </div>
                </div>
        </div> 
    </div>
    

        
       
 
    `,

    data() {
        return {
            professionals: [],
            showRequestForm: false,
            selectedProfessional: null,
            remarks: '',
            date_of_completion: ''
        }
    },

    mounted() {
        let data = localStorage.getItem('professionals');
        console.log(data);
        if (data) {
            this.professionals = JSON.parse(data);
        }
    },

    methods: {
        goBack() {
            this.$router.go(-1);
        },

        openRequestForm(professionalId) {
            this.selectedProfessional = this.professionals.find(pro => pro.id === professionalId);
            this.showRequestForm = true;
        },

        closeRequestForm() {
            this.showRequestForm = false;
            this.remarks = '';
            this.date_of_completion = '';
        },

        async submitRequest() {
            // Format the date to ISO string before sending
            const formattedDate = this.date_of_completion ? new Date(this.date_of_completion).toISOString() : null;

            const requestPayload = {
                remarks: this.remarks,
                date_of_completion: formattedDate
            };

            try {
                const response = await fetch(`${location.origin}/customer/service-request/new/${this.selectedProfessional.id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token')
                    },
                    body: JSON.stringify(requestPayload)
                });

                if (response.ok) {
                    console.log("Request payload:", requestPayload);
                    alert('Service request submitted successfully!');
                    this.closeRequestForm();
                    this.$router.push('/customer-dashboard');
                } else {
                    alert('Failed to submit the request. Please try again.');
                }
            } catch (error) {
                console.error('Error submitting service request:', error);
                alert('There was an error submitting the request.');
            }
        }
    }
}