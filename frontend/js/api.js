// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('token');
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        return headers;
    }

    async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers: this.getHeaders()
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    this.clearToken();
                    window.location.href = 'index.html';
                }
                throw new Error(data.error || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth
    async login(username, password) {
        const data = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        this.setToken(data.token);
        return data;
    }

    // Dashboard
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }

    async getDashboardActivities() {
        return this.request('/dashboard/activities');
    }

    // Akta
    async getAkta(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/akta${queryString ? '?' + queryString : ''}`);
    }

    async getAktaById(id) {
        return this.request(`/akta/${id}`);
    }

    async createAkta(data) {
        return this.request('/akta', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateAkta(id, data) {
        return this.request(`/akta/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteAkta(id) {
        return this.request(`/akta/${id}`, {
            method: 'DELETE'
        });
    }

    // Transaksi
    async getTransaksi(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/transaksi${queryString ? '?' + queryString : ''}`);
    }

    async createTransaksi(data) {
        return this.request('/transaksi', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateTransaksi(id, data) {
        return this.request(`/transaksi/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteTransaksi(id) {
        return this.request(`/transaksi/${id}`, {
            method: 'DELETE'
        });
    }

    // Inventaris
    async getInventaris(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/inventaris${queryString ? '?' + queryString : ''}`);
    }

    async createInventaris(data) {
        return this.request('/inventaris', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateInventaris(id, data) {
        return this.request(`/inventaris/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteInventaris(id) {
        return this.request(`/inventaris/${id}`, {
            method: 'DELETE'
        });
    }

    // Pegawai
    async getPegawai(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/pegawai${queryString ? '?' + queryString : ''}`);
    }

    async createPegawai(data) {
        return this.request('/pegawai', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updatePegawai(id, data) {
        return this.request(`/pegawai/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deletePegawai(id) {
        return this.request(`/pegawai/${id}`, {
            method: 'DELETE'
        });
    }

    // Laporan
    async getLaporan(bulan, tahun) {
        return this.request(`/dashboard/laporan?bulan=${bulan}&tahun=${tahun}`);
    }
}

// Export singleton instance
const api = new APIClient();