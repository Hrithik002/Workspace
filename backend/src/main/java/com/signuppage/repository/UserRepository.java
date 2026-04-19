package com.signuppage.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Optional;

import com.signuppage.model.UserAccount;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public boolean existsByEmail(String email) {
        Integer count = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)",
                Integer.class,
                email.trim()
        );
        return count != null && count > 0;
    }

    public void save(UserAccount user) {
        jdbcTemplate.update(
                "INSERT INTO users (first_name, last_name, email, password_hash) VALUES (?, ?, ?, ?)",
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getPasswordHash()
        );
    }

    public Optional<UserAccount> findByEmail(String email) {
        var users = jdbcTemplate.query(
                "SELECT id, first_name, last_name, email, password_hash, created_at FROM users WHERE LOWER(email) = LOWER(?)",
                new UserAccountRowMapper(),
                email.trim()
        );
        return users.stream().findFirst();
    }

    private static class UserAccountRowMapper implements RowMapper<UserAccount> {

        @Override
        public UserAccount mapRow(ResultSet rs, int rowNum) throws SQLException {
            UserAccount user = new UserAccount();
            user.setId(rs.getLong("id"));
            user.setFirstName(rs.getString("first_name"));
            user.setLastName(rs.getString("last_name"));
            user.setEmail(rs.getString("email"));
            user.setPasswordHash(rs.getString("password_hash"));
            user.setCreatedAt(rs.getString("created_at"));
            return user;
        }
    }
}
