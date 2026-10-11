package com.parking.security;

import com.parking.model.User;
import com.parking.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        User user = userRepository.findById(userId)
                .orElseGet(() -> userRepository.findByNormalizedEmail(userId.toLowerCase().trim())
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with id or email: " + userId)));

        return UserPrincipal.create(user);
    }
}
