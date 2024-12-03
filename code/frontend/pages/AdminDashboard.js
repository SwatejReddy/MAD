export default {
    template: `
    <div style="display: flex;justify-content: center;align-items: center; margin-top: 150px;">
    <div style="margin: auto; width: 50%;border: 2px solid rgb(185, 185, 185); margin-top:20px ;background-color: white;padding: 20px;">
                <h1 style="text-align: center;color: black; font-weight: bolder;">Admin Dashboard</h1> 
                <div style="display: flex; justify-content: space-around ; margin-top: 50px;">
                    <button @click="fetchAllServices()" class="btn btn-dark">All services</button>
                    <button @click="userSearchRedirect()" class="btn btn-dark">Approve/block Users</button>
                    <button v-if="!downloading" @click="generateCSV" class="btn btn-dark">Download CSV</button>
                    <button v-if="downloading" @click="" class="btn btn-dark">Downloading...</button>
                </div>
        </div> 
    </div>

    `,
    data() {
        return {
            downloading: false,
        }
    },
    methods: {
        async generateCSV() {
            this.downloading = true;
            const response = await fetch(`${location.origin}/generate-csv`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            const taskId = (await response.json()).task_id;
            const taskDownload = setInterval(async () => {
                await fetch(`${location.origin}/download-csv/${taskId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                })
                if (response.ok) {
                    this.downloading = false;
                    window.location.href = `${location.origin}/download-csv/${taskId}`;
                    clearInterval(taskDownload);
                }
            }, 1000)
        },
        async fetchAllServices() {
            try {
                console.log('Fetching all services');
                localStorage.removeItem('services');
                const res = await fetch(`${location.origin}/services/all`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authentication-Token': localStorage.getItem('token')
                    }
                });

                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem("services", JSON.stringify(data));
                    this.$router.push('/all-services');
                } else {
                    console.error('Services fetch failed:', res.statusText);
                }
            } catch (error) {
                console.error('Error during services fetch:', error);
            }
        },
        async userSearchRedirect() {
            this.$router.push('/user-search');
        }
    },
}