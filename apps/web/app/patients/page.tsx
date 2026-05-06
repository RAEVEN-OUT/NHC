'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, User, CreditCard, ChevronRight, MoreHorizontal } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface Patient {
  id: string;
  customerCode: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dob: string;
  status: string;
  city: string;
  createdAt: string;
  membershipCards: { cardNumber: string; planType: string; status: string }[];
  registeredBy: { firstName: string; lastName: string };
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append('search', search);
      if (status) query.append('status', status);
      
      const data = await apiGet<Patient[]>(`/patients?${query.toString()}`);
      setPatients(data);
    } catch (err) {
      console.error('Failed to fetch patients', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, status]);

  return (
    <div>
      <header className="page-head">
        <div>
          <h1>Patient Registry</h1>
          <p className="muted">Manage registered customers, family members and membership cards.</p>
        </div>
        <Link href="/patients/create" className="button">
          <Plus size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
          Add New Patient
        </Link>
      </header>

      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="toolbar" style={{ flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 280 }}>
            <Search 
              size={18} 
              style={{ position: 'absolute', left: 12, top: 10, color: '#667085' }} 
            />
            <input 
              style={{ paddingLeft: 40 }} 
              placeholder="Search by name, phone, code or card number..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <select style={{ width: 140 }} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>

            <button className="secondary-button" onClick={() => { setSearch(''); setStatus(''); }}>
              Reset
            </button>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="panel" style={{ textAlign: 'center', padding: '40px' }}>
          Loading registry...
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Customer ID</th>
              <th>Name</th>
              <th>Contact</th>
              <th>Registered By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => {
              const activeCard = p.membershipCards.find(c => c.status === 'ACTIVE');
              return (
                <tr key={p.id}>
                  <td>
                    <code style={{ fontSize: 12, color: '#0f766e', fontWeight: 700 }}>
                      {p.customerCode}
                    </code>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f0fdfa', display: 'grid', placeItems: 'center', color: '#14b8a6' }}>
                        <User size={16} />
                      </div>
                      <div>
                        <strong>{p.firstName} {p.lastName}</strong>
                        <div className="muted" style={{ fontSize: 12 }}>{p.gender}, {new Date().getFullYear() - new Date(p.dob).getFullYear()} yrs</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>{p.phone}</div>
                    <div className="muted" style={{ fontSize: 12 }}>{p.city}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: 13 }}>{p.registeredBy?.firstName} {p.registeredBy?.lastName}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{new Date(p.createdAt).toLocaleDateString()}</div>
                  </td>
                  <td>
                    <span className={p.status === 'ACTIVE' ? 'badge ok' : 'badge blocked'}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-row">
                      <Link href={`/patients/${p.id}`} className="button secondary">
                        View
                      </Link>
                      <button className="secondary-button" style={{ padding: '0 8px' }}>
                        <MoreHorizontal size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {patients.length === 0 && (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#667085' }}>
                  No patients found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
