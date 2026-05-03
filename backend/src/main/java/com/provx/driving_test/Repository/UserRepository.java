package com.provx.driving_test.Repository;

import com.provx.driving_test.models.User;
import com.provx.driving_test.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Auth — find by email for login
    Optional<User> findByEmail(String email);

    // Auth — check if email already registered
    boolean existsByEmail(String email);

    // Admin — list all students
    List<User> findByRole(Role role);

    // Admin — list only active users
    List<User> findByIsActiveTrue();

    // Admin — count students
    long countByRole(Role role);
}