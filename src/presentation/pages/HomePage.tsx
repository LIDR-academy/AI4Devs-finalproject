import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/home.css'

const HomePage = () => {
  const { user } = useAuth()

  return (
    <div className="home-container">
      <header className="home-header">
        <div className="header-content">
          <h1>Frapen Angels</h1>
          <p>Adventure Club Management</p>
        </div>
        <nav className="header-nav">
          {user ? (
            <>
              <span className="user-greeting">Welcome, {user.firstName}!</span>
              <Link to={`/profile/${user.memberId}`} className="btn-nav">
                My Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/auth/login" className="btn-nav">
                Login
              </Link>
              <Link to="/auth/register" className="btn-nav btn-primary">
                Register
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="home-main">
        <section className="hero">
          <div className="hero-content">
            <h2>Welcome to Frapen Angels</h2>
            <p>Your adventure club management platform</p>
            {!user && (
              <div className="hero-buttons">
                <Link to="/auth/login" className="btn btn-primary btn-large">
                  Login
                </Link>
                <Link to="/auth/register" className="btn btn-secondary btn-large">
                  Create Account
                </Link>
              </div>
            )}
          </div>
        </section>

        <section className="features">
          <h2>Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <h3>Manage Profile</h3>
              <p>Keep your personal information up to date</p>
            </div>
            <div className="feature-card">
              <h3>Explore Routes</h3>
              <p>Discover amazing adventures and activities</p>
            </div>
            <div className="feature-card">
              <h3>Book Reservations</h3>
              <p>Register for routes and events easily</p>
            </div>
            <div className="feature-card">
              <h3>Make Payments</h3>
              <p>Secure payment processing for bookings</p>
            </div>
            <div className="feature-card">
              <h3>Calendar View</h3>
              <p>See all upcoming activities at a glance</p>
            </div>
            <div className="feature-card">
              <h3>Notifications</h3>
              <p>Stay updated with club announcements</p>
            </div>
          </div>
        </section>

        <section className="info">
          <h2>About Us</h2>
          <p>
            Frapen Angels is a community dedicated to organizing and managing group activities,
            routes, and adventures. Join us and discover new experiences with like-minded people.
          </p>
        </section>
      </main>

      <footer className="home-footer">
        <p>&copy; 2026 Frapen Angels. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default HomePage
