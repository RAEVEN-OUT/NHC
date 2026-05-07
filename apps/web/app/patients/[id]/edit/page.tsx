'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Save, Plus, X, UserCircle, Home, Phone, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { apiGet, apiPatch } from '@/lib/api';

export default function EditPatientPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'MALE',
    dob: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    district: '',
    state: '',
    pincode: '',
    registrationSource: 'ADMIN',
  });

  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const data = await apiGet<any>(`/patients/${id}`);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          gender: data.gender,
          dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
          phone: data.phone,
          email: data.email || '',
          address: data.address || '',
          city: data.city || '',
          district: data.district || '',
          state: data.state || '',
          pincode: data.pincode || '',
          registrationSource: data.registrationSource,
        });
        setFamilyMembers(data.familyMembers.map((fm: any) => ({
          ...fm,
          dob: fm.dob ? new Date(fm.dob).toISOString().split('T')[0] : '',
        })));
      } catch (err: any) {
        setError('Failed to load patient data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPatient();
  }, [id]);

  const addFamilyMember = () => {
    setFamilyMembers([...familyMembers, { fullName: '', relationship: 'spouse', dob: '', gender: 'MALE' }]);
  };

  const removeFamilyMember = (index: number) => {
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const updateFamilyMember = (index: number, field: string, value: string) => {
    const updated = [...familyMembers];
    updated[index][field] = value;
    setFamilyMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await apiPatch(`/patients/${id}`, {
        ...formData,
        familyMembers: familyMembers
          .filter((fm) => fm.fullName)
          .map((fm) => ({
            fullName: fm.fullName,
            relationship: fm.relationship,
            gender: fm.gender,
            dob: fm.dob || undefined,
            phone: fm.phone || undefined,
          })),
      });
      router.push(`/patients/${id}`);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader2 className="animate-spin" size={40} color="#14b8a6" />
          <p className="muted" style={{ marginTop: 12 }}>Loading patient data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <header className="page-head">
        <div>
          <Link href={`/patients/${id}`} className="muted" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', marginBottom: 8 }}>
            <ChevronLeft size={16} />
            Back to Profile
          </Link>
          <h1>Edit Patient Profile</h1>
          <p className="muted">Updating records for {formData.firstName} {formData.lastName}</p>
        </div>
      </header>

      <form onSubmit={handleSubmit}>
        {error && <div className="notice error">{error}</div>}

        <section className="panel">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <UserCircle size={20} color="#14b8a6" />
            Basic Details
          </h2>
          <div className="form-grid">
            <label>
              First Name *
              <input 
                required 
                value={formData.firstName} 
                onChange={e => setFormData({...formData, firstName: e.target.value})} 
              />
            </label>
            <label>
              Last Name *
              <input 
                required 
                value={formData.lastName} 
                onChange={e => setFormData({...formData, lastName: e.target.value})} 
              />
            </label>
            <label>
              Gender *
              <select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </label>
            <label>
              Date of Birth *
              <input 
                type="date" 
                required 
                value={formData.dob} 
                onChange={e => setFormData({...formData, dob: e.target.value})} 
              />
            </label>
          </div>
        </section>

        <section className="panel">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Home size={20} color="#14b8a6" />
            Contact & Address
          </h2>
          <div className="form-grid">
            <label>
              Phone Number *
              <input 
                required 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </label>
            <label>
              Email Address
              <input 
                type="email" 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </label>
            <div style={{ gridColumn: 'span 2' }}>
              <label>
                Full Address
                <input 
                  value={formData.address} 
                  onChange={e => setFormData({...formData, address: e.target.value})} 
                />
              </label>
            </div>
            <label>
              City
              <input 
                value={formData.city} 
                onChange={e => setFormData({...formData, city: e.target.value})} 
              />
            </label>
            <label>
              Pincode
              <input 
                value={formData.pincode} 
                onChange={e => setFormData({...formData, pincode: e.target.value})} 
              />
            </label>
          </div>
        </section>

        <section className="panel">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
              <Users size={20} color="#14b8a6" />
              Family Members
            </h2>
            <button type="button" className="secondary-button" onClick={addFamilyMember} style={{ minHeight: 32 }}>
              <Plus size={16} style={{ marginRight: 6 }} />
              Add Member
            </button>
          </div>
          
          {familyMembers.length === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: '20px', border: '1px dashed var(--line)', borderRadius: 8 }}>
              No family members added yet.
            </p>
          )}

          {familyMembers.map((member, index) => (
            <div key={index} style={{ position: 'relative', background: '#f9fafb', padding: 16, borderRadius: 8, marginBottom: 12, border: '1px solid var(--line)' }}>
              <button 
                type="button" 
                onClick={() => removeFamilyMember(index)}
                style={{ position: 'absolute', right: 8, top: 8, background: 'transparent', color: '#667085', minHeight: 'auto', padding: 4 }}
              >
                <X size={16} />
              </button>
              <div className="form-grid">
                <label>
                  Full Name
                  <input 
                    value={member.fullName} 
                    onChange={e => updateFamilyMember(index, 'fullName', e.target.value)} 
                  />
                </label>
                <label>
                  Relationship
                  <select value={member.relationship} onChange={e => updateFamilyMember(index, 'relationship', e.target.value)}>
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="parent">Parent</option>
                    <option value="sibling">Sibling</option>
                  </select>
                </label>
                <label>
                  Gender
                  <select value={member.gender} onChange={e => updateFamilyMember(index, 'gender', e.target.value)}>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </label>
                <label>
                  Date of Birth
                  <input 
                    type="date" 
                    value={member.dob} 
                    onChange={e => updateFamilyMember(index, 'dob', e.target.value)} 
                  />
                </label>
              </div>
            </div>
          ))}
        </section>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 40, marginTop: 24 }}>
          <Link href={`/patients/${id}`} className="button secondary">Cancel</Link>
          <button type="submit" className="button" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Save size={18} />
            {saving ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
