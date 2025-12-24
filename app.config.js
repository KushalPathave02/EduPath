export default {
  expo: {
    name: "ISAI Student Welfare",
    slug: "isaii-student-welfare",
    version: "1.0.0",

    icon: "./assets/icon.png",

    // 👇 Web + iOS splash (safe)
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },

    android: {
      package: "com.kushalpathave.isaiistudentwelfare",

      // 🔥 THIS IS THE REAL FIX
      splash: {
        image: "./assets/splash.png",
        resizeMode: "contain",
        backgroundColor: "#ffffff"
      },

      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      }
    }
  }
};
