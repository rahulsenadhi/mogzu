import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Search, ChevronDown, ChevronLeft, Upload, X, Calendar, MapPin, CreditCard, Check, Plus, Minus, AlertCircle } from 'lucide-react';
import { SharedHeader } from './layouts/SharedHeader';
import { SharedSidebar } from './layouts/SharedSidebar';
import { MogzuCorporateScrollSurface } from './layouts/MogzuCorporateScrollSurface';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { DevMockDataBanner } from '@/app/components/global/DevMockDataBanner';
import { useAuth } from '@/lib/auth';
import { createCorporatePendingApprovalBooking } from '@/app/lib/createCorporatePendingApprovalBooking';
import { notifyFirstApprovers } from '@/lib/bookingApprovalMeta';
import {
  evaluateCorporateApproval,
  listRules as listWorkflowRules,
} from '@/lib/approvalWorkflow';
import { db } from '@/lib/db';
import type { ApprovalWorkflowRule, ModuleId } from '@/lib/database.types';

interface Recipient {
  name: string;
  email: string;
  address: string;
  deliveryDate: string;
}

type CelebrationBookingPayload = {
  product: { name: string; image: string; occasion?: string };
  variant: { name: string };
  color: string;
  branding: string;
  quantity: number;
  totalPrice: number;
  listingId?: string;
  vendorId?: string;
  module?: ModuleId;
};

export default function CelebrationBookingFlow() {
  const navigate = useNavigate();
  const { profile, corporateId } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [bookingData, setBookingData] = useState<CelebrationBookingPayload | null>(null);
  const [isFailed, setIsFailed] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usedDemoPersist, setUsedDemoPersist] = useState(false);
  const [workflowRules, setWorkflowRules] = useState<ApprovalWorkflowRule[]>([]);

  const approvalDecision = useMemo(
    () =>
      evaluateCorporateApproval(
        [],
        workflowRules,
        bookingData?.module ?? 'gifting',
        bookingData?.totalPrice ?? 1299,
      ),
    [workflowRules, bookingData?.module, bookingData?.totalPrice],
  );

  // Step 1: Order Details
  const [plannedFor, setPlannedFor] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [approver, setApprover] = useState('');
  const [addGreetingMessage, setAddGreetingMessage] = useState(false);
  const [greetingMessage, setGreetingMessage] = useState('');

  // Step 2: Delivery Details
  const [deliveryMethod, setDeliveryMethod] = useState('single'); // 'single' or 'multiple'
  const [recipients, setRecipients] = useState<Recipient[]>([
    { name: '', email: '', address: '', deliveryDate: '' }
  ]);
  const [singleAddress, setSingleAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliveryContact, setDeliveryContact] = useState('');
  const [deliveryPhone, setDeliveryPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardType, setCardType] = useState('credit');
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  useEffect(() => {
    const savedData = localStorage.getItem('celebrationBooking');
    if (savedData) {
      setBookingData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    if (!corporateId) return;
    void listWorkflowRules(corporateId).then((res) => {
      setWorkflowRules(res.data ?? []);
    });
  }, [corporateId]);

  const steps = [
    { id: 1, name: 'Order Details', icon: 'file' },
    { id: 2, name: 'Delivery', icon: 'truck' },
    { id: 3, name: 'Payment', icon: 'credit-card' }
  ];

  const addRecipient = () => {
    setRecipients([...recipients, { name: '', email: '', address: '', deliveryDate: '' }]);
  };

  const removeRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const persistDemoBooking = () => {
    const newBooking = {
      id: `CELE${Date.now().toString().slice(-6)}`,
      name: bookingData?.product.name || 'Celebration Hamper',
      venue: deliveryMethod === 'single' ? city : `${recipients.length} locations`,
      vendor: 'Mogzu Celebrations',
      assignTo: approver || 'James Brown',
      fromDate: deliveryDate || new Date().toLocaleDateString(),
      toDate: deliveryDate || new Date().toLocaleDateString(),
      attendance: bookingData?.quantity || 10,
      price: bookingData?.totalPrice || 1299,
      status: 'CONFIRMED',
      type: 'Confirmed',
      occasion: bookingData?.product.occasion || 'Celebration',
      variant: bookingData?.variant?.name || 'Standard',
      greetingMessage: addGreetingMessage ? greetingMessage : null,
      deliveryMethod,
      paymentMethod,
      createdAt: new Date().toISOString(),
    };

    const existingBookings = JSON.parse(localStorage.getItem('giftingBookings') || '[]');
    existingBookings.push(newBooking);
    localStorage.setItem('giftingBookings', JSON.stringify(existingBookings));
    setUsedDemoPersist(true);
  };

  const handlePayment = async () => {
    setPaymentNotice('');
    if (paymentMethod === 'card') {
      if (!cardName || !cardNumber || !cardExpiry || !cardCvv) {
        setPaymentNotice('Please fill in all card details before confirming payment.');
        return;
      }
    } else if (paymentMethod === 'upi') {
      if (!upiId) {
        setPaymentNotice('Please enter a valid UPI ID before confirming payment.');
        return;
      }
    }

    setIsSubmitting(true);

    const total = bookingData?.totalPrice ?? 1299;
    const platformFee = Math.round(total * 0.05);
    const baseAmount = Math.max(0, total - platformFee);
    const deliverySummary =
      deliveryMethod === 'single'
        ? [singleAddress, city, state, pincode].filter(Boolean).join(', ')
        : `${recipients.length} recipient(s)`;

    const purposeNote = [
      `Celebration: ${bookingData?.product.name ?? 'Hamper'}`,
      bookingData?.variant?.name ? `Variant: ${bookingData.variant.name}` : null,
      plannedFor ? `Planned for: ${plannedFor}` : null,
      approver ? `Approver: ${approver}` : null,
      `Delivery: ${deliverySummary}`,
      deliveryDate ? `Delivery date: ${deliveryDate}` : null,
      addGreetingMessage && greetingMessage ? `Greeting: ${greetingMessage}` : null,
    ]
      .filter(Boolean)
      .join('\n');

    const listingId = bookingData?.listingId;
    const vendorId = bookingData?.vendorId;
    const canPersistLive =
      Boolean(listingId && vendorId && corporateId && profile?.id);

    if (canPersistLive && listingId && vendorId && corporateId && profile) {
      const needsApproval = approvalDecision.requiresApproval;

      if (needsApproval) {
        const { bookingId, error } = await createCorporatePendingApprovalBooking({
          corporateId,
          userId: profile.id,
          vendorId,
          listingId,
          module: bookingData?.module ?? 'gifting',
          baseAmount,
          addOnsAmount: 0,
          platformFee,
          totalAmount: total,
          purposeNote,
          requiredApprovalLevels: approvalDecision.requiredLevels,
          groupSize: bookingData?.quantity ?? 1,
          startTime: deliveryDate ? new Date(deliveryDate).toISOString() : null,
          endTime: null,
        });

        if (error) {
          setPaymentNotice(error);
          setIsSubmitting(false);
          return;
        }

        if (bookingId) {
          await notifyFirstApprovers(corporateId, approvalDecision.requiredLevels, {
            bookingId,
            title: 'New celebration order awaiting your approval',
            body: `${bookingData?.product.name ?? 'Celebration'} — ₹${total.toLocaleString('en-IN')}.`,
          });
        }

        localStorage.removeItem('celebrationBooking');
        setIsSubmitting(false);

        if (bookingId) {
          navigate('/booking-approval-request', {
            state: {
              category: 'gifting',
              venueName: bookingData?.product.name,
              bookingDate: deliveryDate || undefined,
              totalAmount: total,
              bookingId,
            },
          });
          return;
        }
      } else {
        const { data, error } = await db.bookings.create({
          corporate_id: corporateId,
          user_id: profile.id,
          vendor_id: vendorId,
          listing_id: listingId,
          module: bookingData?.module ?? 'gifting',
          status: 'pending_vendor',
          group_size: bookingData?.quantity ?? 1,
          start_time: deliveryDate ? new Date(deliveryDate).toISOString() : null,
          end_time: null,
          base_amount: baseAmount,
          add_ons_amount: 0,
          platform_fee: platformFee,
          total_amount: total,
          commission_rate: null,
          payment_method: null,
          payment_reference: null,
          payment_status: 'pending',
          purpose_note: purposeNote || null,
          approved_by: null,
          approved_at: null,
          cancelled_at: null,
          cancellation_reason: null,
          cancellation_fee: null,
          vendor_response_deadline: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          completed_at: null,
        });

        if (error || !data) {
          setPaymentNotice(error?.message ?? 'Failed to create booking.');
          setIsSubmitting(false);
          return;
        }

        localStorage.removeItem('celebrationBooking');
        setIsSubmitting(false);
        navigate('/bookings');
        return;
      }
    }

    if (Math.random() < 0.2) {
      setIsFailed(true);
      setIsSubmitting(false);
      return;
    }

    persistDemoBooking();
    localStorage.removeItem('celebrationBooking');
    setIsSubmitting(false);
    navigate('/bookings');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#0e1e3f] mb-1">Order Details</h2>
              <p className="text-xs text-[#64748b] mb-5">Please provide the details for your celebration order</p>

              {bookingData && (
                <div className="bg-[#f8f9fa] rounded-lg p-5 mb-5 border border-[#e5e7eb]">
                  <div className="flex gap-4">
                    <ImageWithFallback
                      src={bookingData.product.image}
                      alt={bookingData.product.name}
                      className="w-20 h-20 object-cover rounded-lg border border-[#e5e7eb]"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#0e1e3f]">{bookingData.product.name}</h3>
                      <p className="text-xs text-[#64748b] mt-0.5">{bookingData.variant.name} - {bookingData.color}</p>
                      <div className="mt-1.5 flex items-center gap-3">
                        <span className="text-xs text-[#64748b]">Qty: {bookingData.quantity}</span>
                        <span className="text-xs px-2 py-0.5 bg-[#dcfce7] text-[#166534] rounded-full">{bookingData.branding}</span>
                      </div>
                      <div className="mt-1.5">
                        <span className="text-lg font-bold text-[#0e1e3f]">₹{bookingData.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1.5">
                    Planned For (Occasion Name) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={plannedFor}
                    onChange={(e) => setPlannedFor(e.target.value)}
                    placeholder="e.g., Annual Day Celebration"
                    className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1.5">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1.5">
                    Select Team/Department
                  </label>
                  <select
                    value={selectedTeam}
                    onChange={(e) => setSelectedTeam(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee] focus:border-transparent bg-white"
                  >
                    <option value="">Select team</option>
                    <option value="sales">Sales Team</option>
                    <option value="marketing">Marketing Team</option>
                    <option value="hr">HR Team</option>
                    <option value="engineering">Engineering Team</option>
                    <option value="all">All Employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#475569] mb-1.5">
                    Approver (Manager/Lead)
                  </label>
                  <input
                    type="text"
                    value={approver}
                    onChange={(e) => setApprover(e.target.value)}
                    placeholder="Manager name"
                    className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Greeting Message */}
              <div className="mt-4 pt-4 border-t border-[#e5e7eb]">
                <div className="flex items-center gap-2.5 mb-2">
                  <input
                    type="checkbox"
                    id="add-greeting"
                    checked={addGreetingMessage}
                    onChange={(e) => setAddGreetingMessage(e.target.checked)}
                    className="w-4 h-4 text-[#4379ee] rounded focus:ring-[#4379ee]"
                  />
                  <label htmlFor="add-greeting" className="text-xs font-medium text-[#475569]">
                    Add personalized greeting message
                  </label>
                </div>
                {addGreetingMessage && (
                  <textarea
                    value={greetingMessage}
                    onChange={(e) => setGreetingMessage(e.target.value)}
                    placeholder="Enter your greeting message..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4379ee] focus:border-transparent"
                  />
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#0e1e3f] mb-1">Delivery Details</h2>
              <p className="text-xs text-[#64748b] mb-5">Choose how you want to receive your order</p>

              {/* Delivery Method */}
              <div className="mb-5">
                <label className="block text-xs font-medium text-[#475569] mb-3">
                  Delivery Method <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setDeliveryMethod('single')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      deliveryMethod === 'single'
                        ? 'border-[#2563eb] bg-[#ebf1ff]'
                        : 'border-[#ececec] hover:border-gray-400'
                    }`}
                  >
                    <MapPin className="w-6 h-6 text-[#2563eb] mb-2" />
                    <div className="font-semibold text-gray-900">Single Address</div>
                    <div className="text-xs text-gray-600 mt-1">Ship all items to one location</div>
                  </button>
                  <button
                    onClick={() => setDeliveryMethod('multiple')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      deliveryMethod === 'multiple'
                        ? 'border-[#2563eb] bg-[#ebf1ff]'
                        : 'border-[#ececec] hover:border-gray-400'
                    }`}
                  >
                    <MapPin className="w-6 h-6 text-[#2563eb] mb-2" />
                    <div className="font-semibold text-gray-900">Multiple Recipients</div>
                    <div className="text-xs text-gray-600 mt-1">Send to different locations</div>
                  </button>
                </div>
              </div>

              {deliveryMethod === 'single' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      value={singleAddress}
                      onChange={(e) => setSingleAddress(e.target.value)}
                      placeholder="Enter complete address"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City *</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State *</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pincode *</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Person *
                      </label>
                      <input
                        type="text"
                        value={deliveryContact}
                        onChange={(e) => setDeliveryContact(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={deliveryPhone}
                        onChange={(e) => setDeliveryPhone(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preferred Delivery Date *
                    </label>
                    <input
                      type="date"
                      value={deliveryDate}
                      onChange={(e) => setDeliveryDate(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recipients List</h3>
                    <button
                      onClick={addRecipient}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Plus className="w-4 h-4" />
                      Add Recipient
                    </button>
                  </div>
                  {recipients.map((recipient, index) => (
                    <div key={index} className="p-4 border border-gray-300 rounded-lg relative">
                      {recipients.length > 1 && (
                        <button
                          onClick={() => removeRecipient(index)}
                          className="absolute top-2 right-2 text-red-600 hover:text-red-700"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                          <input
                            type="text"
                            value={recipient.name}
                            onChange={(e) => {
                              const newRecipients = [...recipients];
                              newRecipients[index].name = e.target.value;
                              setRecipients(newRecipients);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                          <input
                            type="email"
                            value={recipient.email}
                            onChange={(e) => {
                              const newRecipients = [...recipients];
                              newRecipients[index].email = e.target.value;
                              setRecipients(newRecipients);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                          <textarea
                            value={recipient.address}
                            onChange={(e) => {
                              const newRecipients = [...recipients];
                              newRecipients[index].address = e.target.value;
                              setRecipients(newRecipients);
                            }}
                            rows={2}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Date</label>
                          <input
                            type="date"
                            value={recipient.deliveryDate}
                            onChange={(e) => {
                              const newRecipients = [...recipients];
                              newRecipients[index].deliveryDate = e.target.value;
                              setRecipients(newRecipients);
                            }}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-[#0e1e3f] mb-1">Payment Details</h2>
              <p className="text-xs text-[#64748b] mb-5">Review your order and complete the payment</p>
              {paymentNotice && (
                <p
                  className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4"
                  role="status"
                >
                  {paymentNotice}
                </p>
              )}

              {/* Order Summary */}
              {bookingData && (
                <div className="bg-[#f8f9fa] rounded-lg p-5 mb-5 border border-[#e5e7eb]">
                  <h3 className="text-sm font-semibold text-[#0e1e3f] mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Product Price</span>
                      <span className="font-medium">₹{(bookingData.totalPrice * 0.85).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Customization</span>
                      <span className="font-medium">₹{(bookingData.totalPrice * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">GST (5%)</span>
                      <span className="font-medium">₹{(bookingData.totalPrice * 0.05).toFixed(2)}</span>
                    </div>
                    <div className="border-t border-gray-300 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="text-2xl font-bold text-gray-900">₹{bookingData.totalPrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'card'
                        ? 'border-[#2563eb] bg-[#ebf1ff]'
                        : 'border-[#ececec] hover:border-gray-400'
                    }`}
                  >
                    <CreditCard className="w-6 h-6 text-[#2563eb] mb-2 mx-auto" />
                    <div className="font-semibold text-gray-900 text-center">Card</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-[#2563eb] bg-[#ebf1ff]'
                        : 'border-[#ececec] hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2 text-center">📱</div>
                    <div className="font-semibold text-gray-900 text-center">UPI</div>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('vendor')}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      paymentMethod === 'vendor'
                        ? 'border-[#2563eb] bg-[#ebf1ff]'
                        : 'border-[#ececec] hover:border-gray-400'
                    }`}
                  >
                    <div className="text-2xl mb-2 text-center">🏢</div>
                    <div className="font-semibold text-gray-900 text-center">Pay to Vendor</div>
                  </button>
                </div>
              </div>

              {/* Card Payment Form */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Type
                      </label>
                      <select
                        value={cardType}
                        onChange={(e) => setCardType(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select card type</option>
                        <option value="credit">Credit Card</option>
                        <option value="debit">Debit Card</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="Name on card"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number *
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CVV *
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI Payment Form */}
              {paymentMethod === 'upi' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="username@upi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              {/* Vendor Payment Info */}
              {paymentMethod === 'vendor' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    You will coordinate payment directly with the vendor. Our team will connect you with the vendor
                    after order confirmation.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isFailed) {
    return (
      <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
        {/* Left Sidebar */}
        <SharedSidebar 
          collapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Content */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {/* Header */}
          <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} searchPlaceholder="Search" />

          {/* Page Content */}
          <MogzuCorporateScrollSurface className="flex items-center justify-center">
            <div className="max-w-2xl w-full mx-auto px-6">
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                {/* Failure Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertCircle className="w-16 h-16 text-destructive" />
                  </div>
                </div>

                {/* Failure Message */}
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Booking unsuccessful
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Something went wrong while processing your request. Your payment has not been charged.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setIsFailed(false)}
                    className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium text-base hover:bg-blue-700 transition-colors"
                  >
                    Try again
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/communication')}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium text-base hover:bg-gray-50 transition-colors"
                  >
                    Contact support
                  </button>
                </div>
              </div>
            </div>
          </MogzuCorporateScrollSurface>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FFFDF9] overflow-hidden">
      {/* Left Sidebar */}
      <SharedSidebar 
        collapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Main Content */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Header */}
        <SharedHeader onMobileMenuToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Page Content */}
        <MogzuCorporateScrollSurface>
          <div className="max-w-5xl mx-auto px-6 py-6">
            {usedDemoPersist && (
              <div className="mb-4">
                <DevMockDataBanner message="Celebration order saved to demo storage — connect a catalogue listing UUID to persist in Supabase." />
              </div>
            )}
            {/* Progress Steps */}
            <div className="mb-6 bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                  <div key={step.id} className="flex-1 flex items-center">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                          currentStep >= step.id
                            ? 'bg-[#4379ee] text-white shadow-md'
                            : 'bg-[#e5e7eb] text-[#94a3b8]'
                        }`}
                      >
                        {currentStep > step.id ? (
                          <Check className="w-6 h-6" />
                        ) : (
                          step.id
                        )}
                      </div>
                      <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-[#0e1e3f]' : 'text-[#94a3b8]'}`}>{step.name}</span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-1 flex-1 mx-4 transition-all rounded ${
                          currentStep > step.id ? 'bg-[#4379ee]' : 'bg-[#e5e7eb]'
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              {renderStepContent()}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
              <button
                onClick={() => {
                  if (currentStep > 1) {
                    setCurrentStep(currentStep - 1);
                  } else {
                    navigate('/celebrations');
                  }
                }}
                className="px-6 py-2.5 border-2 border-[#e5e7eb] text-[#475569] rounded-lg text-sm font-semibold hover:bg-[#f8f9fa] transition-colors"
              >
                {currentStep === 1 ? '← Back to Catalog' : '← Previous'}
              </button>

              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-8 py-2.5 bg-[#4379ee] text-white rounded-lg text-sm font-semibold hover:bg-[#3568dd] transition-colors shadow-md"
                >
                  Continue to {steps[currentStep].name} →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => void handlePayment()}
                  disabled={isSubmitting}
                  className="px-8 py-2.5 bg-[#10b981] text-white rounded-lg text-sm font-semibold hover:bg-[#059669] transition-colors shadow-md flex items-center gap-2 disabled:opacity-60"
                >
                  <Check className="w-4 h-4" />
                  {isSubmitting ? 'Processing…' : 'Confirm & Pay'}
                </button>
              )}
            </div>
          </div>
        </MogzuCorporateScrollSurface>
      </div>
    </div>
  );
}