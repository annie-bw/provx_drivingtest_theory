package com.provx.driving_test.Repository;

import com.provx.driving_test.models.User;
import com.provx.driving_test.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
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

    // Admin — count active students by role
    long countByRoleAndIsActiveTrue(Role role);

    // Admin — paginated students list
    Page<User> findByRoleOrderByCreatedAtDesc(Role role, Pageable pageable);

    // Admin — paginated active students list
    Page<User> findByRoleAndIsActiveTrueOrderByCreatedAtDesc(Role role, Pageable pageable);

    // Admin — direct count of students by role
    @Query("SELECT COUNT(u) FROM User u WHERE u.role = ?1")
    long countStudents(Role role);

    // Admin — direct count of active students
    @Query("SELECT COUNT(u) FROM User u WHERE u.isActive = true AND u.role = ?1")
    long countActiveStudents(Role role);
}