'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, User, MapPin, Phone, Mail, Calendar, CreditCard, Users, History, ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiDelete } from '@/lib/api';

export default function PatientProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchPatient = async () => {
    try {
      const data = await apiGet(`/patients/${id}`);
      setPatient(data);
    } catch (err) {
      console.error('Failed to fetch patient', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatient();
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this patient?')) return;
    try {
      await apiDelete(`/patients/${id}`);
      router.push('/patients');
    } catch (err) {
      alert('Failed to delete patient');
    }
  };

  if (loading) return <div className="panel" style={{ textAlign: 'center', padding: '100px' }}>Loading profile...</div>;
  if (!patient) return <div className="panel notice error">Patient not found.</div>;

  const activeCard = patient.membershipCards?.find((c: any) => c.status === 'ACTIVE');

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <header className="page-head">
        <div>
          <Link href="/patients" className="muted" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', marginBottom: 8 }}>
            <ArrowLeft size={16} />
            Back to Registry
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#f0fdfa', display: 'grid', placeItems: 'center', color: '#14b8a6' }}>
              <User size={32} />
            </div>
            <div>
              <h1 style={{ marginBottom: 0 }}>{patient.firstName} {patient.lastName}</h1>
              <p className="muted" style={{ margin: 0 }}>{patient.customerCode} • Joined {new Date(patient.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
        <div className="toolbar">
          <Link href={`/patients/${id}/edit`} className="secondary-button" style={{ textDecoration: 'none' }}>
            <Edit size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Edit Profile
          </Link>
          <button className="danger-button" onClick={handleDelete}>
            <Trash2 size={18} style={{ marginRight: 8, verticalAlign: 'middle' }} />
            Delete
          </button>
        </div>
      </header>

      <div className="workbench">
        <div className="activity-list">
          <section className="panel">
            <h2 style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 16 }}>Personal Information</h2>
            <div className="form-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              <div>
                <small className="muted">GENDER</small>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{patient.gender}</div>
              </div>
              <div>
                <small className="muted">DATE OF BIRTH</small>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{new Date(patient.dob).toLocaleDateString()}</div>
              </div>
              <div>
                <small className="muted">AGE</small>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{new Date().getFullYear() - new Date(patient.dob).getFullYear()} Years</div>
              </div>
              <div>
                <small className="muted">PHONE</small>
                <div style={{ fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Phone size={14} className="muted" />
                  {patient.phone}
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <small className="muted">EMAIL</small>
                <div style={{ fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Mail size={14} className="muted" />
                  {patient.email || 'N/A'}
                </div>
              </div>
              <div style={{ gridColumn: 'span 3' }}>
                <small className="muted">ADDRESS</small>
                <div style={{ fontWeight: 700, marginTop: 4, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                  <MapPin size={14} className="muted" style={{ marginTop: 3 }} />
                  {patient.address}, {patient.city}, {patient.district}, {patient.state} - {patient.pincode}
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <h2 style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12, marginBottom: 16 }}>Family Members</h2>
            {patient.familyMembers?.length > 0 ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {patient.familyMembers.map((fm: any) => (
                  <div key={fm.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 12, border: '1px solid var(--line)', borderRadius: 8 }}>
                    <div>
                      <strong>{fm.fullName}</strong>
                      <div className="muted" style={{ fontSize: 12 }}>{fm.relationship} • {fm.gender}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13 }}>{fm.phone || 'No Phone'}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{fm.dob ? new Date(fm.dob).toLocaleDateString() : 'No DOB'}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="muted">No family members registered.</p>
            )}
          </section>
        </div>

        <aside style={{ display: 'grid', gap: 18, alignContent: 'start' }}>
          <section className="panel" style={{ background: activeCard ? '#0f766e' : '#f2f4f7', color: activeCard ? 'white' : 'inherit' }}>
            <h2 style={{ color: activeCard ? 'white' : 'inherit' }}>Membership Card</h2>
            {activeCard ? (
              <div>
                <div style={{ opacity: 0.8, fontSize: 13, marginBottom: 20 }}>{activeCard.cardNumber}</div>
                
                <div style={{ display: 'grid', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ opacity: 0.7 }}>Issued</span>
                    <span>{new Date(activeCard.issueDate).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ opacity: 0.7 }}>Expires</span>
                    <span>{activeCard.expiryDate ? new Date(activeCard.expiryDate).toLocaleDateString() : 'Never'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ opacity: 0.7 }}>Status</span>
                    <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>{activeCard.status}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <CreditCard size={48} className="muted" style={{ marginBottom: 12 }} />
                <p className="muted">No active membership card found.</p>
                <button className="button" style={{ width: '100%', marginTop: 12 }}>Issue New Card</button>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>Lead Source</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              <div>
                <small className="muted">SOURCE</small>
                <div style={{ fontWeight: 700 }}>{patient.registrationSource}</div>
              </div>
              <div>
                <small className="muted">REGISTERED BY</small>
                <div style={{ fontWeight: 700 }}>{patient.registeredBy?.firstName} {patient.registeredBy?.lastName}</div>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
