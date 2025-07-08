const quotes = [
  "Level up your life, one habit at a time!",
  "Consistency is your greatest power.",
  "Small steps every day lead to big changes.",
  "You are the protagonist of your own story.",
  "Aura grows with every check-in!",
];

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

const ProfileCard = ({ user }) => {
  if (!user) return null;
  return (
    <div className="bg-surface/90 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-4 w-72 mt-8">
      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-aura flex items-center justify-center text-4xl text-white font-heading shadow-neon mb-2">
        {/* Placeholder avatar: first letter of email */}
        {user.email?.[0]?.toUpperCase() || 'U'}
      </div>
      <div className="text-lg font-heading text-primary">{user.email}</div>
      <div className="text-md text-aura">Aura Points: <span className="font-bold">{user.auraPoints}</span></div>
      <div className="text-xs text-shadow">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
      <div className="italic text-center text-text mt-2">“{getRandomQuote()}”</div>
    </div>
  );
};

export default ProfileCard;
 