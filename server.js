require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();
app.disable('x-powered-by');
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1);
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// ─── Session Configuration ──────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production'
  }
}));

// ─── Passport Initialization ────────────────────────────────────────────────
app.use(passport.initialize());
app.use(passport.session());

// ─── Serialize / Deserialize User ───────────────────────────────────────────
// Store user object in session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Retrieve user object from session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// ─── Google OAuth 2.0 Strategy ──────────────────────────────────────────────
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/auth/google/callback'
  },
  (accessToken, refreshToken, profile, done) => {
    // Here you could save the user to a database
    // For now, we just pass along the profile info
    const user = {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.emails?.[0]?.value,
      photo: profile.photos?.[0]?.value
    };
    return done(null, user);
  }
));

// ─── Middleware: Check if Authenticated ─────────────────────────────────────
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/');
}

// ─── Auth Routes ────────────────────────────────────────────────────────────

// Initiate Google OAuth flow
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

// Logout
app.get('/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Logout error:', err);
    }
    req.session.destroy();
    res.redirect('/');
  });
});

// ─── API Routes ─────────────────────────────────────────────────────────────

// Get current user profile (protected)
app.get('/profile', isAuthenticated, (req, res) => {
  res.json({
    message: 'You are authenticated!',
    user: req.user
  });
});

// Check auth status
app.get('/auth/status', (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.user || null
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('Make sure you have set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env');
});
